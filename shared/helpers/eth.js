import actions from 'redux/actions'
import config from 'app-config'
import constants from './constants'
import request from './request'
import BigNumber from 'bignumber.js'


const estimateFeeValue = async ({ method = 'send', speed } = {}) => {
  const gasPrice = await estimateGasPrice({ speed })
  const feeValue = new BigNumber(constants.defaultFeeRates.eth.limit[method])
    .times(gasPrice)
    .times(1e-18)
    .toNumber()

  return feeValue
}

const estimateGasPrice = async ({ speed = 'normal' } = {}) => {
  const link = config.feeRates.eth
  const defaultPrice = constants.defaultFeeRates.eth.price

  if (!link) {
    return defaultPrice[speed]
  }

  let apiResult

  try {
    apiResult = await request.get(link)
  } catch (err) {
    console.error(`EstimateFeeRateError: ${err.message}`)
    return defaultPrice[speed]
  }

  const apiRate = {
    slow: apiResult.safeLow * 1e9,
    normal: apiResult.standard * 1e9,
    fast: apiResult.fast * 1e9,
  }

  const currentRate = {
    slow: apiRate.slow >= defaultPrice.slow ? apiRate.slow : defaultPrice.slow,
    normal: apiRate.normal >= defaultPrice.slow ? apiRate.normal : defaultPrice.normal,
    fast: apiRate.fast >= defaultPrice.slow ? apiRate.fast : defaultPrice.fast,
  }

  return currentRate[speed]
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
