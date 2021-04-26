import config from './externalConfig'
import eth from './eth'
import bnb from './bnb'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import BigNumber from 'bignumber.js'

const isEthToken = ({ name }) => Object.keys(config.erc20).includes(name.toLowerCase())
const isEthOrEthToken = ({ name }) => Object.keys(config.erc20).concat('eth').includes(name.toLowerCase())

type EstimateFeeOptions = {
  method: string
  swapABMethod?: 'withdraw' | 'deposit'
  speed: 'fast' | 'normal' | 'slow'
}

const estimateFeeValue = async (options: EstimateFeeOptions) => {
  const { method, speed, swapABMethod } = options
  const gasPrice = await estimateGasPrice({ speed })
  const methodForLimit = swapABMethod === 'deposit'
    ? 'swapDeposit'
    : swapABMethod === 'withdraw'
      ? 'swapWithdraw'
      : method
  const defaultGasLimit = DEFAULT_CURRENCY_PARAMETERS.ethToken.limit[methodForLimit]
  const feeValue = new BigNumber(defaultGasLimit)
    .multipliedBy(gasPrice)
    .multipliedBy(1e-18)
    .toNumber()

  return feeValue
}

const estimateGasPrice = ({ speed }) => {
  return config.binance
    ? bnb.estimateGasPrice()
    : eth.estimateGasPrice({ speed })
}

export default {
  estimateFeeValue,
  estimateGasPrice,
  isEthToken,
  isEthOrEthToken,
}
