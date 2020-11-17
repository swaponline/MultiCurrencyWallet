import config from 'app-config'
import constants from './constants'
import request from './request'
import BigNumber from 'bignumber.js'


const estimateFeeValue = async ({ method = 'send', speed } = {}) => {
  const gasPrice = await estimateGasPrice({ speed })
  const feeValue = new BigNumber(constants.defaultFeeRates.eth.limit[method])
    .multipliedBy(gasPrice)
    .multipliedBy(1e-18)
    .toString()

  return feeValue
}

const estimateGasPrice = async ({ speed = 'fast' } = {}) => {
  /* 
  * speed can be - slow, normal, fast
  */
  const link = config.feeRates.eth
  const defaultPrice = constants.defaultFeeRates.eth.price

  if (!link) {
    return defaultPrice[speed]
  }

  let apiResult

  try {
    apiResult = await request.get(link, { cacheResponse: 60000 })
    /* 
    * can used: safeLow, standard, fast, fastest
    */
    constants.minAmount.eth = apiResult.standard
  } catch (err) {
    console.error(`EstimateGasPrice: ${err.message}`)
    return defaultPrice[speed]
  }

  const apiSpeeds = {
    slow: 'safeLow',
    normal: 'standard',
    fast: 'fast',
  }

  const apiSpeed = apiSpeeds[speed] || apiSpeed.normal

  const apiPrice = new BigNumber(apiResult[apiSpeed]).multipliedBy(1e9)

  return apiPrice >= defaultPrice[speed] ? apiPrice.toString() : defaultPrice[speed]
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
