import ethLikeHelper from 'common/helpers/ethLikeHelper'

// TODO: =================================

// ! Deprecated. Use common/helpers/ethLikeHelper.matic

// TODO: =================================

type EstimateFeeParams = {
  method: string
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  return ethLikeHelper.matic.estimateFeeValue(params)
}

const estimateGasPrice = async (): Promise<number> => {
  return ethLikeHelper.matic.estimateGasPrice()
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
