import config from './externalConfig'
import erc20Like from 'common/erc20Like'

// TODO: =================================

// ! Deprecated. Use common/erc20Like

// TODO: =================================

const isEthOrEthToken = ({ name }) => Object.keys(config.erc20).concat('eth').includes(name.toLowerCase())

type EstimateFeeOptions = {
  method: string
  swapABMethod?: 'withdraw' | 'deposit'
  speed: 'fast' | 'normal' | 'slow'
}

const estimateFeeValue = async (options: EstimateFeeOptions) => {
  return erc20Like.erc20.estimateFeeValue(options)
}

const estimateGasPrice = (params) => {
  return erc20Like.erc20.estimateFeeValue(params)
}

export default {
  estimateFeeValue,
  estimateGasPrice,
  isEthOrEthToken,
}
