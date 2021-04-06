import config from 'app-config'
import web3 from 'helpers/web3'
import ERC20_ABI from 'human-standard-token-abi'

const reportAboutProblem = (params) => {
  const { isError = false, info } = params

  console.group(
    'common > %c erc20tokens',
    `color: ${isError ? 'red' : 'orange'};`
  )
  isError ? console.error(info) : console.warn(info)
  console.groupEnd()
}


type CheckAllowanceParams = {
  tokenOwnerAddress: string
  tokenContractAddress: string
}

const checkAllowance = async (params: CheckAllowanceParams): Promise<number> => {
  const { tokenOwnerAddress, tokenContractAddress } = params
  const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenContractAddress)

  let allowanceAmount = 0

  try {
    allowanceAmount = await tokenContract.methods
      .allowance(tokenOwnerAddress, config.swapContract.erc20)
      .call({ from: tokenOwnerAddress })
  } catch (error) {
    reportAboutProblem({
      info: error,
    })
  }

  return allowanceAmount
}

export default {
  checkAllowance,
}