import coininfo from 'coininfo'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from 'app-config'
import constants from './constants'
import request from './request'
import BigNumber from 'bignumber.js'


const networkCoininfo = process.env.MAINNET
  ? coininfo.litecoin.main
  : coininfo.litecoin.test
const network = networkCoininfo.toBitcoinJS()

const estimateFeeValue = async ({ method = 'send', satoshi = false, speed } = {}) => {
  const { user: { ltcData: { address } } } = getState()

  const feeRate = await estimateFeeRate({ speed })
  const unspents = await actions.ltc.fetchUnspents(address)
  const txIn = Number(unspents.length)
  const txOut = 2

  let txSize = constants.defaultFeeRates.ltc.size[method]

  if (txIn !== 0 && method !== 'swap') {
    txSize = txIn * 146 + txOut * 33 + txIn * 16
  }

  const feeValue = new BigNumber(feeRate)
    .multipliedBy(txSize)
    .div(1024)
    .dp(0, BigNumber.ROUND_HALF_EVEN)

  if (satoshi) {
    return feeValue.toString()
  }

  return feeValue.multipliedBy(1e-8).toString()
}

const estimateFeeRate = async ({ speed = 'fast' } = {}) => {
  const link = config.feeRates.ltc
  const defaultRate = constants.defaultFeeRates.ltc.rate

  if (!link) {
    return defaultRate[speed]
  }

  let apiResult

  try {
    apiResult = await request.get(link)
  } catch (err) {
    console.error(`EstimateFeeRate: ${err.message}`)
    return defaultRate[speed]
  }

  const apiSpeeds = {
    slow: 'low_fee_per_kb',
    normal: 'medium_fee_per_kb',
    fast: 'high_fee_per_kb',
  }

  const apiSpeed = apiSpeeds[speed] || apiSpeed.normal

  const apiRate = new BigNumber(apiResult[apiSpeed])

  return apiRate.isGreaterThanOrEqualTo(defaultRate[speed])
    ? apiRate.toString()
    : defaultRate[speed]
}

export default {
  estimateFeeValue,
  estimateFeeRate,
  network,
}
