import * as bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import config from './externalConfig'
import btcUtils from 'common/utils/coin/btc'

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

  const feeValue = await btcUtils.estimateFeeValue({
    feeRate,
    inSatoshis,
    speed,
    address,
    amount,
    toAddress,
    method,
    txSize,
    swapUTXOMethod,
    serviceFee: hasAdminFee,
    fixed,
    moreInfo,
    NETWORK,
  })

  return feeValue
}



export default {
  estimateFeeValue,
  network,
}
