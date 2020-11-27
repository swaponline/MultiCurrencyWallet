import actions from 'redux/actions'
import config from './externalConfig'
import eth from './eth'
import constants from './constants'
import BigNumber from 'bignumber.js'


const isEthToken = ({ name }) => Object.keys(config.erc20).includes(name.toLowerCase())
const isEthOrEthToken = ({ name }) => Object.keys(config.erc20).concat('eth').includes(name.toLowerCase())

type EstimateFeeOptions = {
  method: string
  speed: string
}

const estimateFeeValue = async (options: EstimateFeeOptions) => {
  /* 
  * method -> send, swap
  * speed -> slow, fast, fastest
  */
  const { method, speed } = options
  const gasPrice = await estimateGasPrice({ speed })
  const feeValue = new BigNumber(constants.defaultFeeRates.ethToken.limit[method])
    .multipliedBy(gasPrice)
    .multipliedBy(1e-18)
    .toString()

  return +feeValue
}

//@ts-ignore
const estimateGasPrice = ({ speed } = {}) => eth.estimateGasPrice({ speed })

export default {
  estimateFeeValue,
  estimateGasPrice,
  isEthToken,
  isEthOrEthToken,
}
