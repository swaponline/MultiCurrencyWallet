import config from 'app-config'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import api from './api'
import BigNumber from 'bignumber.js'

type EstimateFeeParams = {
  method: string
  speed: 'fastest' | 'fast' | 'slow'
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  const { method, speed } = params
  const gasPrice = await estimateGasPrice({ speed })
  const defaultGasLimit = DEFAULT_CURRENCY_PARAMETERS.eth.limit[method]
  const theSmallestPart = 1e-18 // TODO: replace 18 with 8

  return new BigNumber(defaultGasLimit)
    .multipliedBy(gasPrice)
    .multipliedBy(theSmallestPart)
    .toNumber()
}

// TODO: new gas API

const estimateGasPrice = async ({ speed = 'fast' } = {}) => {
  const link = config.feeRates.bnb
  const defaultPrice = DEFAULT_CURRENCY_PARAMETERS.eth.price

  if (!link) {
    return defaultPrice[speed]
  }

  let apiResult

  try {
    apiResult = await api.asyncFetchApi(link)
  } catch (err) {
    return defaultPrice[speed]
  }

  const apiSpeeds = {
    slow: 'safeLow',
    fast: 'fast',
    fastest: 'fastest',
  }

  const apiSpeed = apiSpeeds[speed] || apiSpeeds.fast
  /* 
  * api returns gas price in x10 Gwei
  * divided by 10 to convert it to gwei
  */
  const apiPrice = new BigNumber(apiResult[apiSpeed])
    .dividedBy(10)
    .multipliedBy(1e9)
    .toNumber()

  return apiPrice >= defaultPrice[speed] ? apiPrice : defaultPrice[speed]
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
