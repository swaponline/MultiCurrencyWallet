import * as bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import { default as bitcoinUtils } from '../../../common/utils/coin/btc'
import config from './externalConfig'
import DEFAULT_CURRENCY_PARAMETERS from './constants/DEFAULT_CURRENCY_PARAMETERS'
import api from './api'

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

  const feeValue = bitcoinUtils.estimateFeeValue({
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
    serviceFee: hasAdminFee,
  })

  return feeValue
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

export default {
  estimateFeeValue,
  getFeesRateBlockcypher,
  network,
}
