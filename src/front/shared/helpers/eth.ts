import config from 'app-config'
import constants from './constants'
import api from './api'
import BigNumber from 'bignumber.js'

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
  const feeValue = new BigNumber(constants.defaultFeeRates.eth.limit[method])
    .multipliedBy(gasPrice)
    .multipliedBy(1e-18)
    .toNumber()

  return +feeValue
}

const estimateGasPrice = async ({ speed = 'fast' } = {}) => {
  const link = config.feeRates.eth
  const defaultPrice = constants.defaultFeeRates.eth.price

  if (!link) {
    return defaultPrice[speed]
  }

  let apiResult

  try {
    apiResult = await api.asyncFetchApi(link)
  } catch (err) {
    console.error(`EstimateGasPrice: ${err.message}`)
    return defaultPrice[speed]
  }

  const apiSpeeds = {
    slow: 'safeLow',
    fast: 'fast',
    fastest: 'fastest',
  }

  const apiSpeed = apiSpeeds[speed] || apiSpeeds.fast
  /* 
  * api returns gas price in x10 Gwei
  * divided by 10 to convert it to gwei
  */
  const apiPrice = new BigNumber(apiResult[apiSpeed]).dividedBy(10).multipliedBy(1e9)

  return apiPrice >= defaultPrice[speed] 
    ? apiPrice.toString()
    : defaultPrice[speed]
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
