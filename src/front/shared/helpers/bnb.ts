import config from 'app-config'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import api from './api'
import BigNumber from 'bignumber.js'

type EstimateFeeParams = {
  method: string
  speed: 'fastest' | 'fast' | 'slow'
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  const { method } = params
  const gasPrice = await estimateGasPrice()
  const defaultGasLimit = DEFAULT_CURRENCY_PARAMETERS.eth.limit[method]
  const theSmallestPart = 1e-18

  return new BigNumber(defaultGasLimit)
    .multipliedBy(gasPrice)
    .multipliedBy(theSmallestPart)
    .toNumber()
}

// function has to return GWEI value
const estimateGasPrice = async () => {
  const defaultPrice = DEFAULT_CURRENCY_PARAMETERS.eth.price
  let apiResponse

  try {
    // returned in wei value
    apiResponse = await api.asyncFetchApi(config.feeRates.bsc)
  } catch (err) {
    return defaultPrice.fast
  }
  // convert to decimal value
  const weiGasPrice = parseInt(apiResponse.result).toString(10)
  const gweiGasPrice = new BigNumber(weiGasPrice)
    .dividedBy(1e9)
    .toNumber()

  return gweiGasPrice > defaultPrice.fast
    ? gweiGasPrice
    : defaultPrice.fast
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
