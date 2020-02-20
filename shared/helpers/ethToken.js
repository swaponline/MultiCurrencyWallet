import actions from 'redux/actions'
import config from 'app-config'
import eth from './eth'
import constants from './constants'
import BigNumber from 'bignumber.js'


const isEthToken = ({ name }) => Object.keys(config.erc20).includes(name.toLowerCase())
const isEthOrEthToken = ({ name }) => Object.keys(config.erc20).concat('eth').includes(name.toLowerCase())

const estimateFeeValue = async ({ method = 'send', speed } = {}) => {
  const gasPrice = await estimateGasPrice({ speed })
  const feeValue = new BigNumber(constants.defaultFeeRates.ethToken.limit[method])
    .multipliedBy(gasPrice)
    .multipliedBy(1e-18)
    .toString()

  return feeValue
}
const getTx = (txRaw) => {

  return txRaw.transactionHash
}

const getLinkToInfo = (tx) => {

  if(!tx) {
    return
  }

  return `https://etherscan.io/tx/${tx}`
}


const estimateGasPrice = ({ speed } = {}) => eth.estimateGasPrice({ speed })

export default {
  estimateFeeValue,
  estimateGasPrice,
  isEthToken,
  isEthOrEthToken,
  getTx,
  getLinkToInfo
}
