import ethLikeHelper from 'common/helpers/ethLikeHelper'

// TODO: =================================

// ! Deprecated. Use common/helpers/ethLikeHelper.phi

// TODO: =================================

type EstimateFeeParams = {
  method: string
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  return ethLikeHelper.phpx.estimateFeeValue(params)
}

const estimateGasPrice = async (): Promise<number> => {
  return ethLikeHelper.phpx.estimateGasPrice()
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
