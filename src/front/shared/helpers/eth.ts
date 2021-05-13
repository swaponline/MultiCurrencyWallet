import ethLikeHelper from 'common/helpers/ethLikeHelper'

// TODO: =================================

// ! Deprecated. Use common/helpers/ethLikeHelper.eth

// TODO: =================================

type EstimateFeeParams = {
  method: string
  speed: 'fastest' | 'fast' | 'slow'
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  return ethLikeHelper.eth.estimateFeeValue(params)
}

const estimateGasPrice = async (params) => {
  return ethLikeHelper.eth.estimateGasPrice(params)
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
