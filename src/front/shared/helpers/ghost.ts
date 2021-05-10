import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from './externalConfig'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import constants from 'common/helpers/constants'
import request from 'common/utils/request'
import BigNumber from 'bignumber.js'


const networks = {
  mainnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'gp',
    bip32: {
      public:  0x68DF7CBD,
      private: 0x8E8EA8EA,
    },
    pubKeyHash: 0x26,
    scriptHash: 0x61,
    wif: 0xA6,
  },
  testnet: {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'tghost',
    bip32: {
      public: 0xe1427800,
      private: 0x04889478,
    },
    pubKeyHash: 0x4B,
    scriptHash: 0x89,
    wif: 0x2e,
  }
}


const hasAdminFee = (
  config
    && config.opts
    && config.opts.fee
    && config.opts.fee.ghost
    && config.opts.fee.ghost.fee
) ? config.opts.fee.ghost : false

const network = process.env.MAINNET
  ? networks.mainnet
  : networks.testnet

const DUST = 546 // description in ./btc.ts

// getByteCount({'MULTISIG-P2SH:2-4':45},{'P2PKH':1}) Means "45 inputs of P2SH Multisig and 1 output of P2PKH"
// getByteCount({'P2PKH':1,'MULTISIG-P2SH:2-3':2},{'P2PKH':2}) means "1 P2PKH input and 2 Multisig P2SH (2 of 3) inputs along with 2 P2PKH outputs"
const getByteCount = (inputs, outputs) => {
  const { TRANSACTION } = constants
  let totalWeight = 0
  let hasWitness = false
  let inputCount = 0
  let outputCount = 0
  // assumes compressed pubkeys in all cases.
  const types = {
    'inputs': {
      'MULTISIG-P2SH': TRANSACTION.MULTISIG_P2SH_IN_SIZE * 4,
      'MULTISIG-P2WSH': TRANSACTION.MULTISIG_P2WSH_IN_SIZE + (41 * 4),
      'MULTISIG-P2SH-P2WSH': TRANSACTION.MULTISIG_P2SH_P2WSH_IN_SIZE + (76 * 4),
      'P2PKH': TRANSACTION.P2PKH_IN_SIZE * 4,
      'P2WPKH': TRANSACTION.P2WPKH_IN_SIZE + (41 * 4),
      'P2SH-P2WPKH': TRANSACTION.P2SH_P2WPKH_IN_SIZE + (64 * 4),
    },
    'outputs': {
      'P2SH': TRANSACTION.P2SH_OUT_SIZE * 4,
      'P2PKH': TRANSACTION.P2PKH_OUT_SIZE * 4,
      'P2WPKH': TRANSACTION.P2WPKH_OUT_SIZE * 4,
      'P2WSH': TRANSACTION.P2WSH_OUT_SIZE * 4,
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
  const { TRANSACTION } = constants
  const defaultTxSize = DEFAULT_CURRENCY_PARAMETERS.ghost.size[method]

  if (fixed) {
    return defaultTxSize
  }

  unspents = unspents || await actions.ghost.fetchUnspents(address)

  const txIn = unspents.length
  let txSize = defaultTxSize
  
  if (txIn > 0) {
    txSize =
      txIn * TRANSACTION.P2PKH_IN_SIZE +
      txOut * TRANSACTION.P2PKH_OUT_SIZE +
      (TRANSACTION.TX_SIZE + txIn - txOut)
  }

  if (method === 'send_multisig') {
    const msuSize = getByteCount(
      { 'MULTISIG-P2SH-P2WSH:2-2': 1 },
      { 'P2PKH': (hasAdminFee) ? 3 : 2 }
    )
    const msutxSize =
      txIn * msuSize +
      txOut * TRANSACTION.P2PKH_OUT_SIZE +
      (TRANSACTION.TX_SIZE + txIn - txOut)

    return msutxSize
  }

  if (method === 'send_2fa') {
    const msSize = getByteCount(
      { 'MULTISIG-P2SH-P2WSH:2-3': 1 },
      { 'P2PKH': (hasAdminFee) ? 3 : 2 }
    )
    const mstxSize =
      txIn * msSize +
      txOut * TRANSACTION.P2PKH_OUT_SIZE +
      (TRANSACTION.TX_SIZE + txIn - txOut)

    return mstxSize
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
}

const estimateFeeValue = async (options: EstimateFeeValueOptions) => {
  let { feeRate, inSatoshis, speed, address, txSize, fixed, method } = options
  const {
    user: {
      ghostData,
      ghostMultisigSMSData,
      ghostMultisigUserData,
    },
  } = getState()

  const txOut = hasAdminFee
    ? method === 'send'
      ? 3
      : 2
    : 2

  if (!address) {
    address = ghostData.address
    //@ts-ignore
    if (method === 'send_2fa') address = ghostMultisigSMS
    if (method === 'send_multisig') address = ghostMultisigUserData.address
  }

  //@ts-ignore
  txSize = txSize || await calculateTxSize({ address, speed, fixed, method, txOut })
  feeRate = feeRate || await estimateFeeRate({ speed })

  const calculatedFeeValue = BigNumber.maximum(
    DUST,
    //@ts-ignore: strictNullChecks
    new BigNumber(feeRate)
      //@ts-ignore: strictNullChecks
      .multipliedBy(txSize)
      .div(1024) // divide by one kilobyte
      .dp(0, BigNumber.ROUND_HALF_EVEN),
  )

  const finalFeeValue = inSatoshis
    ? calculatedFeeValue.toString()
    : calculatedFeeValue.multipliedBy(1e-8).toString()

  console.log(`Ghost withdraw fee speed(${speed}) method (${method}) ${finalFeeValue}`)
  return finalFeeValue
}

const estimateFeeRate = async ({ speed = 'fast' } = {}) => {
  const link = config.feeRates.ghost
  const defaultRate = DEFAULT_CURRENCY_PARAMETERS.ghost.rate

  if (!link) {
    return defaultRate[speed]
  }

  let apiResult

  try {
    apiResult = await request.get(link, { cacheResponse: 60000 })
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
    ? apiRate.toString()
    : defaultRate[speed]
}

export default {
  calculateTxSize,
  estimateFeeValue,
  estimateFeeRate,
  network,
  networks,
}
