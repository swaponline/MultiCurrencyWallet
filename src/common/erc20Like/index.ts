import config from 'app-config'
import ERC20_ABI from 'human-standard-token-abi'
import { BigNumber } from 'bignumber.js'
import TOKEN_STANDARDS from 'common/helpers/constants/TOKEN_STANDARDS'
import web3 from 'helpers/web3'

const reportAboutProblem = (params) => {
  const { isError = false, info } = params

  console.group(
    'common > %c erc20Like',
    `color: ${isError ? 'red' : 'orange'};`
  )
  isError ? console.error(info) : console.warn(info)
  console.groupEnd()
}

const isToken = (params) => {
  const { name } = params

  for (const prop in TOKEN_STANDARDS) {
    const standard = TOKEN_STANDARDS[prop].standard

    if (Object.keys(config[standard])?.includes(name.toLowerCase())) {
      return true
    }
  }

  return false
}

type CheckAllowanceParams = {
  tokenOwnerAddress: string
  tokenContractAddress: string
  decimals: number
}

const checkAllowance = async (params: CheckAllowanceParams): Promise<number> => {
  const { tokenOwnerAddress, tokenContractAddress, decimals } = params
  const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenContractAddress)

  let allowanceAmount = 0

  try {
    allowanceAmount = await tokenContract.methods
      .allowance(tokenOwnerAddress, config.swapContract.erc20)
      .call({ from: tokenOwnerAddress })
    
    // formating without token decimals
    allowanceAmount = new BigNumber(allowanceAmount)
      .dp(0, BigNumber.ROUND_UP)
      .div(new BigNumber(10).pow(decimals))
      .toNumber()
  } catch (error) {
    reportAboutProblem({
      info: error,
    })
  }

  return allowanceAmount
}

export default {
  isToken,
  checkAllowance,
}