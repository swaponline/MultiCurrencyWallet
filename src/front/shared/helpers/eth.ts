import ethLikeHelper from 'common/helpers/ethLikeHelper'

// TODO: =================================

// ! Deprecated. Use common/helpers/ethLikeHelper.eth

// TODO: =================================

type EstimateFeeParams = {
  method: string
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  return ethLikeHelper.eth.estimateFeeValue(params)
}

const estimateGasPrice = async (): Promise<number> => {
  return ethLikeHelper.eth.estimateGasPrice()
}

const getShortAddress = (address: string): string => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ``

export default {
  estimateFeeValue,
  estimateGasPrice,
  getShortAddress,
}
