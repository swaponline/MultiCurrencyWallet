import { getState } from 'redux/core'
import actions from 'redux/actions'
import config from 'app-config'
import eth from './eth'


const isEthToken = ({ name }) => Object.keys(config.erc20).includes(name)

const estimateFeeValue = async ({ speed }) => {
  const { user: { tokensData } } = getState()

  const gasRate = tokensData[Object.keys(tokensData)[0]].gasRate.limit
  const gasPrice = await estimateGasPrice({ speed })
  const feeValue = gasRate * gasPrice * 1e-18

  return feeValue
}

const estimateGasPrice = ({ speed } = {}) => eth.estimateGasPrice({ speed })

export default {
  estimateFeeValue,
  estimateGasPrice,
  isEthToken,
}
