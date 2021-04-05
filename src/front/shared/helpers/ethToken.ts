import config from './externalConfig'
import eth from './eth'
import web3 from './web3'
import ERC20_ABI from 'human-standard-token-abi'
import DEFAULT_CURRENCY_PARAMETERS from './constants/DEFAULT_CURRENCY_PARAMETERS'
import BigNumber from 'bignumber.js'

const reportAboutProblem = (params) => {
  const { isError = false, info } = params

  console.group(
    'HELPERS > %c ethToken.ts',
    `color: ${isError ? 'red' : 'yellow'};`
  )
  isError ? console.error(info) : console.warn(info)
  console.groupEnd()
}


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

const estimateGasPrice = ({ speed }) => eth.estimateGasPrice({ speed })

type CheckAllowanceParams = {
  tokenAddress: string
  tokenContractAddress: string
}

const checkAllowance = async (params: CheckAllowanceParams): Promise<number> => {
  const { tokenAddress, tokenContractAddress } = params
  const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenContractAddress)

  let result = 0

  try {
    result = await tokenContract.methods
      .allowance(tokenAddress, config.swapContract.erc20)
      .call({ from: tokenAddress })
  } catch (error) {
    reportAboutProblem({
      info: error,
    })
  }

  // FIXME: delete comment
  console.group('%c CheckAllowance', 'color: yellow;')
  console.log('result: ', result)
  console.groupEnd()

  return result
}


export default {
  estimateFeeValue,
  estimateGasPrice,
  isEthToken,
  isEthOrEthToken,
  checkAllowance,
}
