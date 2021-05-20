import ethLikeHelper from 'common/helpers/ethLikeHelper'

// TODO: =================================

// ! Deprecated. Use common/helpers/ethLikeHelper.bnb

// TODO: =================================

type EstimateFeeParams = {
  method: string
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  return ethLikeHelper.bnb.estimateFeeValue(params)
}

const estimateGasPrice = async (): Promise<number> => {
  return ethLikeHelper.bnb.estimateGasPrice()
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
