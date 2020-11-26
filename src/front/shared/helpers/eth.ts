import config from 'app-config'
import constants from './constants'
import api from './api'
import BigNumber from 'bignumber.js'

type EstimateFeeOptions = {
  method: string
  speed: string
}

const estimateFeeValue = async (options: EstimateFeeOptions) => {
  /* 
  * method -> send, swap
  * speed -> safeLow, standard, fast, fastest
  */
  const { method, speed } = options
  const gasPrice = await estimateGasPrice({ speed })
  const feeValue = new BigNumber(constants.defaultFeeRates.eth.limit[method])
    .multipliedBy(gasPrice)
    .multipliedBy(1e-18)
    .toString()

  return +feeValue
}

const estimateGasPrice = async ({ speed = 'fast' } = {}) => {
  const link = config.feeRates.eth
  const defaultPrice = constants.defaultFeeRates.eth.price

  if (!link) {
    return defaultPrice[speed]
  }

  let apiResult

  try {
    apiResult = await api.asyncFetchApi(link)
  } catch (err) {
    console.error(`EstimateGasPrice: ${err.message}`)
    return defaultPrice[speed]
  }

  const apiSpeeds = {
    slow: 'safeLow',
    normal: 'standard',
    fast: 'fast',
    fastest: 'fastest',
  }

  //@ts-ignore
  const apiSpeed = apiSpeeds[speed] || apiSpeed.normal

  const apiPrice = new BigNumber(apiResult[apiSpeed]).multipliedBy(1e9)

  return apiPrice >= defaultPrice[speed] ? apiPrice.toString() : defaultPrice[speed]
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
