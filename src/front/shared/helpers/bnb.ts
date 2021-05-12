import config from 'app-config'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import api from './api'
import BigNumber from 'bignumber.js'

// TODO: =================================

// ! Deprecated. Use common/helpers/ethLikeHelper.bnb

// TODO: =================================

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

const estimateGasPrice = async (): Promise<number> => {
  const defaultGasPrice = DEFAULT_CURRENCY_PARAMETERS.eth.price
  let apiResponse

  try {
    // returned in hex wei value
    apiResponse = await api.asyncFetchApi(config.feeRates.bsc)
  } catch (err) {
    return defaultGasPrice.fast
  }
  // convert to decimal value
  const weiGasPrice = new BigNumber(parseInt(apiResponse.result).toString(10))

  return weiGasPrice.isGreaterThan(defaultGasPrice.fast)
    ? weiGasPrice.toNumber()
    : defaultGasPrice.fast
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
