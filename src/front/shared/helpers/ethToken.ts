import actions from 'redux/actions'
import config from './externalConfig'
import eth from './eth'
import constants from './constants'
import BigNumber from 'bignumber.js'


const isEthToken = ({ name }) => Object.keys(config.erc20).includes(name.toLowerCase())
const isEthOrEthToken = ({ name }) => Object.keys(config.erc20).concat('eth').includes(name.toLowerCase())

<<<<<<< HEAD
type EstimateFeeValue = {
=======
type EstimateFeeOptions = {
>>>>>>> f5c632a4ca26d055e8d34f88c54924df79f03bff
  method: string
  speed: string
}

<<<<<<< HEAD
const estimateFeeValue = async (options: EstimateFeeValue) => {
  const { method = 'send', speed = 'fast' } = options
=======
const estimateFeeValue = async (options: EstimateFeeOptions) => {
  /* 
  * method -> send, swap
  * speed -> slow, fast, fastest
  */
  const { method, speed } = options
>>>>>>> f5c632a4ca26d055e8d34f88c54924df79f03bff
  const gasPrice = await estimateGasPrice({ speed })
  const feeValue = new BigNumber(constants.defaultFeeRates.ethToken.limit[method])
    .multipliedBy(gasPrice)
    .multipliedBy(1e-18)
    .toNumber()

  return +feeValue
}


const estimateGasPrice = ({ speed }) => eth.estimateGasPrice({ speed })

export default {
  estimateFeeValue,
  estimateGasPrice,
  isEthToken,
  isEthOrEthToken,
}
