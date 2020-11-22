import * as bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from './externalConfig'
import constants from './constants'
import api from './api'
import BigNumber from 'bignumber.js'


const hasAdminFee = (
  config
    && config.opts
    && config.opts.fee
    && config.opts.fee.btc
    && config.opts.fee.btc.fee
) ? config.opts.fee.btc : false

const network = process.env.MAINNET
  ? bitcoin.networks.bitcoin
  : bitcoin.networks.testnet

const DUST = 546

// getByteCount({'MULTISIG-P2SH:2-4':45},{'P2PKH':1}) Means "45 inputs of P2SH Multisig and 1 output of P2PKH"
// getByteCount({'P2PKH':1,'MULTISIG-P2SH:2-3':2},{'P2PKH':2}) means "1 P2PKH input and 2 Multisig P2SH (2 of 3) inputs along with 2 P2PKH outputs"
const getByteCount = (inputs, outputs) => {
  let totalWeight = 0
  let hasWitness = false
  let inputCount = 0
  let outputCount = 0
  // assumes compressed pubkeys in all cases.
  const types = {
    'inputs': {
      'MULTISIG-P2SH': 49 * 4,
      'MULTISIG-P2WSH': 6 + (41 * 4),
      'MULTISIG-P2SH-P2WSH': 6 + (76 * 4),
      'P2PKH': 148 * 4,
      'P2WPKH': 108 + (41 * 4),
      'P2SH-P2WPKH': 108 + (64 * 4),
    },
    'outputs': {
      'P2SH': 32 * 4,
      'P2PKH': 34 * 4,
      'P2WPKH': 31 * 4,
      'P2WSH': 43 * 4,
    },
  }

  const checkUInt53 = (n) => {
    if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range')
  }

  const varIntLength = (number) => {
    checkUInt53(number)

    return (
      number < 0xfd ? 1
        : number <= 0xffff ? 3
          : number <= 0xffffffff ? 5
            : 9
    )
  }

  Object.keys(inputs).forEach((key) => {
    checkUInt53(inputs[key])
    if (key.slice(0, 8) === 'MULTISIG') {
      // ex. "MULTISIG-P2SH:2-3" would mean 2 of 3 P2SH MULTISIG
      const keyParts = key.split(':')
      if (keyParts.length !== 2) throw new Error(`invalid input: ${key}`)
      const newKey = keyParts[0]
      const mAndN = keyParts[1].split('-').map((item) => parseInt(item))

      totalWeight += types.inputs[newKey] * inputs[key]
      const multiplyer = (newKey === 'MULTISIG-P2SH') ? 4 : 1
      totalWeight += ((73 * mAndN[0]) + (34 * mAndN[1])) * multiplyer * inputs[key]
    } else {
      totalWeight += types.inputs[key] * inputs[key]
    }
    inputCount += inputs[key]
    if (key.indexOf('W') >= 0) hasWitness = true
  })

  Object.keys(outputs).forEach((key) => {
    checkUInt53(outputs[key])
    totalWeight += types.outputs[key] * outputs[key]
    outputCount += outputs[key]
  })

  if (hasWitness) totalWeight += 2

  totalWeight += 8 * 4
  totalWeight += varIntLength(inputCount) * 4
  totalWeight += varIntLength(outputCount) * 4

  return Math.ceil(totalWeight / 4)
}

//@ts-ignore
const calculateTxSize = async ({ speed, unspents, address, txOut = 2, method = 'send', fixed } = {}) => {
  const defaultTxSize = constants.defaultFeeRates.btc.size[method]

  if (fixed) {
    return defaultTxSize
  }

  unspents = unspents || await actions.btc.fetchUnspents(address)


  const txIn = unspents.length
  const txSize = txIn > 0
    ? txIn * 146 + txOut * 33 + (15 + txIn - txOut)
    : defaultTxSize

  if (method === 'send_multisig') {
    const msuSize = getByteCount(
      { 'MULTISIG-P2SH-P2WSH:2-2': 1 },
      { 'P2PKH': (hasAdminFee) ? 3 : 2 }
    )
    const msutxSize = txIn * msuSize + txOut * 33 + (15 + txIn - txOut)

    return msutxSize
  }

  if (method === 'send_2fa') {
    const msSize = getByteCount(
      { 'MULTISIG-P2SH-P2WSH:2-3': 1 },
      { 'P2PKH': (hasAdminFee) ? 3 : 2 }
    )
    const mstxSize = txIn * msSize + txOut * 33 + (15 + txIn - txOut)

    return mstxSize
  }

  return txSize
}

//@ts-ignore
const estimateFeeValue = async ({ feeRate, inSatoshis, speed, address, txSize, fixed, method } = {}) => {
  const {
    user: {
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
    },
  } = getState()

  let txOut = 2

  if (hasAdminFee) txOut = 3

  if (!address) {
    address = btcData.address
    if (method === 'send_2fa') address = btcMultisigSMSData.address
    if (method === 'send_multisig') address = btcMultisigUserData.address
  }

  //@ts-ignore
  txSize = txSize || await calculateTxSize({ address, speed, fixed, method, txOut })
  feeRate = feeRate || await estimateFeeRate({ speed })

  const calculatedFeeValue = BigNumber.maximum(
    DUST,
    //@ts-ignore
    BigNumber(feeRate)
      .multipliedBy(txSize)
      .div(1024)
      .dp(0, BigNumber.ROUND_HALF_EVEN),
  )

  // Используем комиссию больше рекомендованной на 5 сатоши
  calculatedFeeValue.plus(20)

  const finalFeeValue = inSatoshis
    ? calculatedFeeValue.toString()
    : calculatedFeeValue.multipliedBy(1e-8).toString()

  console.log(`Btc withdraw fee speed(${speed}) method (${method}) ${finalFeeValue}`)
  return finalFeeValue
}

const estimateFeeRateBitcoinfees = async ({ speed = 'fast' } = {}) => {
  const defaultRate = constants.defaultFeeRates.btc.rate

  let apiResult

  try {
    apiResult = await api.asyncFetchApi(`https://bitcoinfees.earn.com/api/v1/fees/recommended`)
  } catch (err) {
    console.error(`EstimateFeeRate: ${err.message}`)
    return defaultRate[speed]
  }

  const apiSpeeds = {
    slow: `hourFee`,
    normal: `halfHourFee`,
    fast: `fastestFee`,
  }
  //@ts-ignore
  const apiSpeed = apiSpeeds[speed] || apiSpeed.normal
  //@ts-ignore
  const apiRate = new BigNumber(apiResult[apiSpeed]).multipliedBy(1024)

  return apiRate.isGreaterThanOrEqualTo(DUST)
    ? apiRate.toString()
    : defaultRate[speed]
}

const estimateFeeRateBlockcypher = async ({ speed = 'fast' } = {}) => {
  const link = config.feeRates.btc
  const defaultRate = constants.defaultFeeRates.btc.rate

  if (!link) {
    return defaultRate[speed]
  }

  let apiResult

  try {
    apiResult = await api.asyncFetchApi(link)
  } catch (err) {
    console.error(`EstimateFeeRate: ${err.message}`)
    return defaultRate[speed]
  }

  const apiSpeeds = {
    slow: 'low_fee_per_kb',
    normal: 'medium_fee_per_kb',
    fast: 'high_fee_per_kb',
  }
  //@ts-ignore
  const apiSpeed = apiSpeeds[speed] || apiSpeed.normal
  //@ts-ignore
  const apiRate = new BigNumber(apiResult[apiSpeed])

  return apiRate.isGreaterThanOrEqualTo(DUST)
    ? apiRate.toString()
    : defaultRate[speed]
}

const estimateFeeRate = estimateFeeRateBlockcypher

export default {
  calculateTxSize,
  estimateFeeValue,
  estimateFeeRate,
  network,
}
