import BigNumber from 'bignumber.js'

type EstimateFeeParams = {
  method: string
}

const estimateFeeValue = async (params: EstimateFeeParams) => {
  console.log('TRC estimateFeeValue', params)
  return new BigNumber(0.4)
}

const estimateGasPrice = async (): Promise<number> => {
  return 0
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
