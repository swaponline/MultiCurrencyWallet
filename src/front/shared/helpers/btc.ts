import * as bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from './externalConfig'
import constants from 'common/helpers/constants'
import btcUtils from 'common/utils/coin/btc'
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

  // let unspents: IBtcUnspent[] = await actions.btc.fetchUnspents(address)
  // // if user have some amount then try to find "better" UTXO for this
  // if (amount) {
  //   unspents = await actions.btc.prepareUnspents({ amount, unspents })
  // }

  // // one input for output from the script when swapping
  // const txIn = unspents.length
  // // 2 = recipient input + sender input (for a residue)
  // // 3 = the same inputs like higher + input for admin fee
  // let txOut = hasAdminFee
  //   ? method === 'send'
  //     ? 3
  //     : 2
  //   : 2

  // if (method === 'swap' && swapUTXOMethod === 'withdraw') {
  //   txOut = 1
  // }

  // feeRate = feeRate || await btcUtils.estimateFeeRate({ speed, NETWORK })
  // txSize = txSize || await btcUtils.calculateTxSize({
  //   fixed,
  //   method,
  //   txIn,
  //   txOut,
  //   toAddress,
  //   address,
  // })

  // const calculatedFeeValue = BigNumber.maximum(
  //   constants.TRANSACTION.DUST_SAT,
  //   new BigNumber(feeRate)
  //     .multipliedBy(txSize)
  //     .div(1024) // divide by one kilobyte
  //     .dp(0, BigNumber.ROUND_HALF_EVEN),
  // )

  // const SATOSHI_TO_BITCOIN_RATIO = 0.000_000_01

  // const finalFeeValue = inSatoshis
  //   ? calculatedFeeValue.toNumber()
  //   : calculatedFeeValue.multipliedBy(SATOSHI_TO_BITCOIN_RATIO).toNumber()

  // if (moreInfo) {
  //   return {
  //     fee: calculatedFeeValue.multipliedBy(SATOSHI_TO_BITCOIN_RATIO).toNumber(),
  //     satoshis: calculatedFeeValue.toNumber(),
  //     txSize,
  //     feeRate,
  //     unspents,
  //   }
  // }

  return feeValue
}



export default {
  estimateFeeValue,
  network,
}
