import * as bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from './externalConfig'
import DEFAULT_CURRENCY_PARAMETERS from './constants/DEFAULT_CURRENCY_PARAMETERS'
import constants from 'common/helpers/constants'
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

const reportAboutProblem = (params) => {
  const { isError = false, info } = params

  console.group(
    'HELPERS >%c btc.ts',
    `color: ${isError ? 'red' : 'yellow'};`
  )
  isError ? console.error(info) : console.warn(info)
  console.groupEnd()
}

enum Network {
  mainnet = "mainnet",
  testnet = "testnet",
}

enum AddressType {
  p2pkh = "P2PKH",
  p2sh = "P2SH",
  p2wpkh = "P2WPKH",
  p2wsh = "P2WSH",
}

const addressTypes: { [key: number]: { type: AddressType, network: Network } } = {
  0x00: {
    type: AddressType.p2pkh,
    network: Network.mainnet,
  },

  0x6f: {
    type: AddressType.p2pkh,
    network: Network.testnet,
  },

  0x05: {
    type: AddressType.p2sh,
    network: Network.mainnet,
  },

  0xc4: {
    type: AddressType.p2sh,
    network: Network.testnet,
  },
};

const getAddressType = (address: string) => {
  const prefix = hasAdminFee.address.substr(0, 2);
  let version;
  let data;
  let addressType;

  if (prefix === 'bc' || prefix === 'tb') {
    const { data: benchVersion } = bitcoin.address.fromBech32(address)
    data = benchVersion;
    return addressType = data.length === 20 ? AddressType.p2wpkh : AddressType.p2wsh;

  } else {
    const { version: baseVersion } = bitcoin.address.fromBase58Check(address)
    version = baseVersion
    const { type } = addressTypes[version]
    return addressType = type
  }
}
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

type CalculateTxSizeParams = {
  txIn: number
  txOut: number
  method?: string
  fixed?: boolean
  toAddress?: string
}

const calculateTxSize = async (params: CalculateTxSizeParams) => {
  let {
    txIn,
    txOut,
    method,
    fixed,
    toAddress
  } = params

  method = method || 'send'

  const { TRANSACTION } = constants
  const defaultTxSize = DEFAULT_CURRENCY_PARAMETERS.btc.size[method]

  if (fixed) {
    return defaultTxSize
  }

  let txSize = defaultTxSize
  // general formula
  // (<one input size> × <number of inputs>) + (<one output size> × <number of outputs>) + <tx size>
  if (txIn > 0) {
    txSize =
      txIn * TRANSACTION.P2PKH_IN_SIZE +
      txOut * TRANSACTION.P2PKH_OUT_SIZE +
      (TRANSACTION.TX_SIZE + txIn - txOut)
  }

  if (method === 'send_multisig') {
    let outputs = {
      'P2SH': 1,
    }
    const toAddressType = toAddress ? getAddressType(toAddress) : "P2PKH";
    outputs[toAddressType] = ++outputs[toAddressType] || 1;

    if (hasAdminFee) {
      const adminAddressType = getAddressType(hasAdminFee.address);
      outputs[adminAddressType] = ++outputs[adminAddressType] || 1;
      ++txOut
    }
    txSize = getByteCount(
      { 'MULTISIG-P2SH:2-2': 1 },
      outputs
    )
  }

  if (method === 'send_2fa') {
    let outputs = {
      'P2SH': 1,
    }
    const toAddressType = toAddress ? getAddressType(toAddress) : "P2PKH";
    outputs[toAddressType] = ++outputs[toAddressType] || 1;

    if (hasAdminFee) {
      const adminAddressType = getAddressType(hasAdminFee.address);
      outputs[adminAddressType] = ++outputs[adminAddressType] || 1;
      ++txOut
    }
    txSize = getByteCount(
      { 'MULTISIG-P2SH:2-3': txIn },
      outputs
    )

    /*
    txSize =
      txIn * msSize +
      txOut * transaction.P2PKH_OUT_SIZE +
      (transaction.TX_SIZE + txIn - txOut)
    */
  }

  console.group('Helpers >%c btc > calculateTxSize', 'color: green;')
  console.log('txIn: ', txIn)
  console.log('txOut: ', txOut)
  console.log('txSize: ', txSize)
  console.groupEnd()

  return txSize
}

type EstimateFeeValueParams = {
  method?: string
  speed: 'fast' | 'normal' | 'slow'
  feeRate?: number
  inSatoshis?: boolean
  address?: string
  txSize?: number
  fixed?: boolean
  amount?: number
  toAddress?: string
  swapUTXOMethod?: 'withdraw' | 'deposit'
  moreInfo?: boolean
}
// Returned fee value in the satoshi
const estimateFeeValue = async (params: EstimateFeeValueParams): Promise<any> => {
  let {
    feeRate,
    inSatoshis,
    speed,
    address,
    txSize,
    fixed,
    method,
    amount,
    toAddress,
    swapUTXOMethod,
    moreInfo,
  } = params
  const {
    user: {
      btcData,
      btcMultisigSMSData,
      btcMultisigUserData,
    },
  } = getState()

  if (!address) {
    address = btcData.address
    if (method === 'send_2fa') address = btcMultisigSMSData.address
    if (method === 'send_multisig') address = btcMultisigUserData.address
  }

  let unspents: IBtcUnspent[] = await actions.btc.fetchUnspents(address)
  // if user have some amount then try to find "better" UTXO for this
  if (amount) {
    unspents = await actions.btc.prepareUnspents({ amount, unspents })
  }

  // one input for output from the script when swapping
  const txIn = swapUTXOMethod === 'withdraw' ? 1 : unspents.length
  // 2 = recipient input + sender input (for a residue)
  // 3 = the same inputs like higher + input for admin fee
  const txOut = hasAdminFee
    ? method === 'send'
      ? 3
      : 2
    : 2

  feeRate = feeRate || await estimateFeeRate({ speed })
  txSize = txSize || await calculateTxSize({
    fixed,
    method,
    txIn,
    txOut,
    toAddress
  })

  const calculatedFeeValue = BigNumber.maximum(
    constants.TRANSACTION.DUST_SAT,
    new BigNumber(feeRate)
      .multipliedBy(txSize)
      .div(1024) // divide by one kilobyte
      .dp(0, BigNumber.ROUND_HALF_EVEN),
  )

  const SATOSHI_TO_BITCOIN_RATIO = 0.000_000_01

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

const getFeesRateBlockcypher = async () => {
  const link = config.feeRates.btc
  const defaultRate = DEFAULT_CURRENCY_PARAMETERS.btc.rate

  const defaultApiSpeeds = {
    slow: defaultRate.slow,
    normal: defaultRate.normal,
    fast: defaultRate.fast,
    custom: 50 * 1024,
  }

  if (!link) {
    return defaultApiSpeeds
  }

  let apiResult

  try {
    // api returns sotoshi in 1 kb
    apiResult = await api.asyncFetchApi(link)
  } catch (err) {
    reportAboutProblem({ info: err })
    return defaultApiSpeeds
  }

  const apiRate = {
    slow: apiResult.low_fee_per_kb,
    normal: apiResult.medium_fee_per_kb,
    fast: apiResult.high_fee_per_kb,
    custom: 50 * 1024,
  }

  return apiRate;
}

const estimateFeeRate = async ({ speed = 'fast' } = {}) => {
  const link = config.feeRates.btc
  const defaultRate = DEFAULT_CURRENCY_PARAMETERS.btc.rate

  if (!link) {
    return defaultRate[speed]
  }

  let apiResult

  try {
    // api returns sotoshi in 1 kb
    apiResult = await api.asyncFetchApi(link)
  } catch (err) {
    reportAboutProblem({ info: err })
    return defaultRate[speed]
  }

  const apiSpeeds = {
    slow: 'low_fee_per_kb',
    normal: 'medium_fee_per_kb',
    fast: 'high_fee_per_kb',
  }

  const apiSpeed = apiSpeeds[speed] || apiSpeeds.normal
  const apiRate = new BigNumber(apiResult[apiSpeed])

  return apiRate.isGreaterThanOrEqualTo(constants.TRANSACTION.DUST_SAT)
    ? apiRate.toNumber()
    : defaultRate[speed]
}

export default {
  calculateTxSize,
  estimateFeeValue,
  estimateFeeRate,
  getFeesRateBlockcypher,
  network,
}
