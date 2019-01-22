import bitcoin from 'bitcoinjs-lib'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from 'app-config'
import constants from './constants'
import request from './request'
import BigNumber from 'bignumber.js'


const network = process.env.MAINNET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

const estimateFeeValue = async ({ method = 'send', satoshi = false, speed } = {}) => {
  const { user: { btcData: { address } } } = getState()

  const feeRate = await estimateFeeRate({ speed })
  const unspents = await actions.btc.fetchUnspents(address)
  const txIn = Number(unspents.length)
  const txOut = 2

  let txSize = constants.defaultFeeRates.btc.size[method]

  if (txIn !== 0 && method !== 'swap') {
    txSize = txIn * 146 + txOut * 33 + txIn * 16
  }
  console.log('txSize', txSize)
  const feeValue = new BigNumber(feeRate).times(txSize).div(1024).dp(0, BigNumber.ROUND_HALF_EVEN)

  if (satoshi) {
    return feeValue.toNumber()
  }

  return feeValue.times(1e-8).toNumber()
}

const estimateFeeRate = async ({ speed = 'normal' } = {}) => {
  const link = config.feeRates.btc
  const defaultFee = constants.defaultFeeRates.btc.rate

  if (!link) {
    return defaultFee[speed]
  }

  let apiResult

  try {
    apiResult = await request.get(link)
  } catch (err) {
    console.error(`EstimateFeeRateError: ${err.message}`)
    return defaultFee[speed]
  }

  const apiRate = {
    slow: apiResult.low_fee_per_kb,
    normal: Math.ceil((apiResult.low_fee_per_kb + apiResult.high_fee_per_kb) / 2),
    fast: apiResult.high_fee_per_kb,
  }

  const currentRate = {
    slow: apiRate.slow >= defaultFee.slow ? apiRate.slow : defaultFee.slow,
    normal: apiRate.normal >= defaultFee.slow ? apiRate.normal : defaultFee.normal,
    fast: apiRate.fast >= defaultFee.slow ? apiRate.fast : defaultFee.fast,
  }

  return currentRate[speed]
}

export default {
  estimateFeeValue,
  estimateFeeRate,
  network,
}
