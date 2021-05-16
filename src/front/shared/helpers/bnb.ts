import ethLikeHelper from 'common/helpers/ethLikeHelper'

// TODO: =================================

// ! Deprecated. Use common/helpers/ethLikeHelper.bnb

// TODO: =================================

type EstimateFeeParams = {
  method: string
  speed: 'fastest' | 'fast' | 'slow'
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  return ethLikeHelper.bnb.estimateFeeValue(params)
}

const estimateGasPrice = async (): Promise<number> => {
  return ethLikeHelper.bnb.estimateGasPriceForBnb()
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
