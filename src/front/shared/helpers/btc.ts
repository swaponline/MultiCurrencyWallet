import * as bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from './externalConfig'
import constants from './constants'
import api from './api'
import BigNumber from 'bignumber.js'
import { IBtcUnspent } from 'common/utils/coin/btc'


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

/* 
* Bitcoin dust - small amount of bitcoin that remains in a particular wallet 
* because the monetary value is so tiny that it is below the amount of the
* fee required to spend the bitcoin. It makes the transaction impossible 
* to process
*
* Default value:
* - dustRelayFee (3000 satochi / kb)
* - output P2PKH
*/
const DUST = 546 // satoshi
const BYTE_INPUT_ADDRESS = 146 // ~ 146 byte
const BYTE_OUTPUT_ADDRESS = 33 // ~ 33 byte
const BYTE_TRANSACTION = 15 // ~ 15 byte

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

interface IcalculateTxSizeOptions {
  amount?: number
  unspents?: any
  address: string
  txOut?: number
  method?: string
  fixed?: boolean
}
const calculateTxSize = async (options: IcalculateTxSizeOptions) => {
  let {
    amount,
    unspents,
    address,
    txOut,
    method,
    fixed,
  } = options

  txOut = txOut || 2
  method = method || 'send'

  const defaultTxSize = constants.defaultFeeRates.btc.size[method]

  if (fixed) {
    return defaultTxSize
  }

  unspents = unspents || await actions.btc.fetchUnspents(address)
  if (amount) {
    unspents = await actions.btc.prepareUnspents({ amount, unspents })
  }
  /*
  * Formula with 2 input and 2 output addresses 
  * (BYTE_INPUT_ADDRESS × 2 ) + (BYTE_OUTPUT_ADDRESS × 2) + BYTE_TRANSACTION
  */
  const txIn = unspents.length
  const txSize = txIn > 0
    ? txIn * BYTE_INPUT_ADDRESS + txOut * BYTE_OUTPUT_ADDRESS + (BYTE_TRANSACTION + txIn - txOut)
    : defaultTxSize

  if (method === 'send_multisig') {
    const msuSize = getByteCount(
      { 'MULTISIG-P2SH-P2WSH:2-2': 1 },
      { 'P2PKH': (hasAdminFee) ? 3 : 2 }
    )
    const msutxSize = txIn * msuSize + txOut * BYTE_OUTPUT_ADDRESS + (BYTE_TRANSACTION + txIn - txOut)

    return msutxSize
  }

  if (method === 'send_2fa') {
    const msSize = getByteCount(
      { 'MULTISIG-P2SH-P2WSH:2-3': txIn },
      { 'P2PKH': (hasAdminFee) ? 3 : 2 }
    )
    console.log('Tx size', msSize)
    return msSize
    /*
    const mstxSize = txIn * msSize + txOut * BYTE_OUTPUT_ADDRESS + (BYTE_TRANSACTION + txIn - txOut)

    return mstxSize
    */
  }

  return txSize
}

type EstimateFeeValueOptions = {
  method?: string
  speed: 'fast' | 'normal' | 'slow'
  feeRate?: number
  inSatoshis?: boolean
  address?: string
  txSize?: number
  fixed?: string
  amount?: number
  moreInfo?: boolean
}

const estimateFeeValue = async (options: EstimateFeeValueOptions): Promise<any> => {
  const { moreInfo } = options
  let { feeRate, inSatoshis, speed, address, txSize, fixed, method, amount } = options
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

  let unspents = await actions.btc.fetchUnspents(address)
  if (amount) {
    unspents = await actions.btc.prepareUnspents({ amount, unspents })
  }
  //@ts-ignore
  txSize = txSize || await calculateTxSize({ address, speed, fixed, method, txOut, amount })
  feeRate = feeRate || await estimateFeeRate({ speed })

  const calculatedFeeValue = BigNumber.maximum(
    DUST,
    new BigNumber(feeRate)
      .multipliedBy(txSize)
      .div(1024) // divide by one kilobyte
      .dp(0, BigNumber.ROUND_HALF_EVEN),
  )

  const CUSTOM_SATOSHI = 20
  calculatedFeeValue.plus(CUSTOM_SATOSHI) // just wanted to add

  const SATOSHI_TO_BITCOIN_RATIO = 1e-8; // 1 BTC -> 100 000 000 satoshi
  
  const finalFeeValue = inSatoshis
    ? calculatedFeeValue.toNumber()
    : calculatedFeeValue.multipliedBy(SATOSHI_TO_BITCOIN_RATIO).toNumber()

  if (moreInfo) {
    return {
      fee: calculatedFeeValue.multipliedBy(SATOSHI_TO_BITCOIN_RATIO).toNumber(),
      satoshis: calculatedFeeValue.toNumber(),
      txSize,
      feeRate,
      unspents,
    }
  }
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

  const apiSpeed = apiSpeeds[speed] || apiSpeeds.normal
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
    // api returns sotoshi in 1 kb
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

  const apiSpeed = apiSpeeds[speed] || apiSpeeds.normal
  const apiRate = new BigNumber(apiResult[apiSpeed])

  return apiRate.isGreaterThanOrEqualTo(DUST) 
    ? apiRate.toNumber()
    : defaultRate[speed]
}

const estimateFeeRate = estimateFeeRateBlockcypher

export default {
  calculateTxSize,
  estimateFeeValue,
  estimateFeeRate,
  network,
}
