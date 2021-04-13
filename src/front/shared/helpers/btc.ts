import * as bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from './externalConfig'
import DEFAULT_CURRENCY_PARAMETERS from './constants/DEFAULT_CURRENCY_PARAMETERS'
import constants from 'common/helpers/constants'
import btcHelper from 'common/helpers/btc'
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


const NETWORK = process.env.MAINNET
  ? 'MAINNET'
  : 'TESTNET'

const reportAboutProblem = (params) => {
  const { isError = false, info } = params

  console.group(
    'HELPERS >%c btc.ts',
    `color: ${isError ? 'red' : 'yellow'};`
  )
  isError ? console.error(info) : console.warn(info)
  console.groupEnd()
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
  txSize = txSize || await btcHelper.calculateTxSize({
    fixed,
    method,
    txIn,
    txOut,
    toAddress,
    address,
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
  estimateFeeValue,
  estimateFeeRate,
  getFeesRateBlockcypher,
  network,
}
