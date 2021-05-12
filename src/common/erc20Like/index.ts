import config from 'app-config'
import TokenApi from 'human-standard-token-abi'
import { BigNumber } from 'bignumber.js'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import TOKEN_STANDARDS from 'common/helpers/constants/TOKEN_STANDARDS'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import { feedback } from 'helpers'
import web3 from 'helpers/web3'

class erc20LikeHelper {
  readonly standard: string // (ex. erc20, bep20, ...)
  readonly currency: string // (ex. ETH)
  readonly currencyKey: string // (ex. eth)
  readonly defaultParams: IUniversalObj

  constructor(params) {
    const {
      standard,
      currency,
      currencyKey,
      defaultParams,
    } = params

    this.standard = standard
    this.currency = currency
    this.currencyKey = currencyKey
    this.defaultParams = defaultParams
  }

  reportError = (error) => {
    feedback.helpers.failed(
      ''.concat(`details - standard: ${this.standard}, `, `error message - ${error.message} `)
    )
    console.group(`Common erc20LikeHelper >%c ${this.standard}`, 'color: red;')
    console.error('error: ', error)
    console.groupEnd()
  }

  estimateFeeValue = async (params): Promise<number> => {
    const { method, speed, swapABMethod } = params
    const gasPrice = await this.estimateGasPrice({ speed })
    const methodForLimit = swapABMethod === 'deposit'
      ? 'swapDeposit'
      : swapABMethod === 'withdraw'
        ? 'swapWithdraw'
        : method
    const defaultGasLimit = this.defaultParams.limit[methodForLimit]

    return new BigNumber(defaultGasLimit)
      .multipliedBy(gasPrice)
      .multipliedBy(1e-18)
      .toNumber()
  }

  estimateGasPrice = async (params): Promise<number> => {
    return ethLikeHelper[this.currencyKey].estimateGasPrice(params)
  }

  isToken = (params): boolean => {
    const { name } = params

    return Object.keys(config[this.standard]).includes(name.toLowerCase())
  }

  checkAllowance = async (params): Promise<number> => {
    const { tokenOwnerAddress, tokenContractAddress, decimals } = params
    const tokenContract = new web3.eth.Contract(TokenApi, tokenContractAddress)
  
    let allowanceAmount
  
    try {
      allowanceAmount = await tokenContract.methods
        .allowance(tokenOwnerAddress, config.swapContract[this.standard])
        .call({ from: tokenOwnerAddress })
      
      // formatting without token decimals
      allowanceAmount = new BigNumber(allowanceAmount)
        .dp(0, BigNumber.ROUND_UP)
        .div(new BigNumber(10).pow(decimals))
        .toNumber()
    } catch (error) {
      this.reportError(error)
    }

    return allowanceAmount || 0
  }
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

// TODO: =========== delete code below ====================

type CheckAllowanceParams = {
  tokenOwnerAddress: string
  tokenContractAddress: string
  decimals: number
}

const checkAllowance = async (params: CheckAllowanceParams): Promise<number> => {
  const { tokenOwnerAddress, tokenContractAddress, decimals } = params
  const tokenContract = new web3.eth.Contract(TokenApi, tokenContractAddress)

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
    console.error(error)
  }

  return allowanceAmount
}

// TODO: =========== delete code above ====================

export default {
  isToken,
  checkAllowance,
  erc20: new erc20LikeHelper({
    standard: 'erc20',
    currency: 'ETH',
    currencyKey: 'eth',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.ethToken,
  }),
  bep20: new erc20LikeHelper({
    standard: 'bep20',
    currency: 'BNB',
    currencyKey: 'bnb',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.ethToken,
  }),
}