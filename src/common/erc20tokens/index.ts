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

  console.group('%c common CheckAllowance', `color: yellow;`)
  console.log('tokenAddress: ', tokenAddress)
  console.log('tokenContractAddress: ', tokenContractAddress)
  console.log('config.swapContract.erc20: ', config.swapContract.erc20)
  console.log('result: ', result)
  console.groupEnd()

  return result
}

export default {
  checkAllowance,
}