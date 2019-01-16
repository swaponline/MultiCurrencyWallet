import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from 'app-config'


const estimateFeeValue = async ({ speed }) => {
  const { user: { ethData: { gasRate } } } = getState()

  const gasPrice = await estimateGasPrice({ speed })
  const feeValue = gasRate.limit * gasPrice * 1e-18

  return feeValue
}

const estimateGasPrice = async ({ speed } = { speed: 'normal' }) => {
  await actions.eth.setGasRate()

  const { user: { ethData: { gasRate } } } = getState()

  return gasRate.price[speed]
}

export default {
  estimateFeeValue,
  estimateGasPrice,
}
