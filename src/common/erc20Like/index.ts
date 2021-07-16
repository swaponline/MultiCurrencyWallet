import Web3 from 'web3'
import config from 'app-config'
import TokenApi from 'human-standard-token-abi'
import { BigNumber } from 'bignumber.js'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import { COIN_DATA, COIN_MODEL } from 'swap.app/constants/COINS'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import { feedback, metamask } from 'helpers'


class erc20LikeHelper {
  readonly standard: string // (ex. erc20, bep20, erc20Matic, ...)
  readonly currency: string // (ex. ETH)
  readonly currencyKey: string // (ex. eth)
  readonly defaultParams: IUniversalObj
  readonly Web3: IUniversalObj

  constructor(params) {
    const {
      standard,
      currency,
      defaultParams,
      web3,
    } = params

    this.standard = standard
    this.currency = currency
    this.currencyKey = currency.toLowerCase()
    this.defaultParams = defaultParams
    this.Web3 = web3
  }

  reportError = (params) => {
    const { error, sendFeedback = false } = params

    if (sendFeedback) {
      feedback.helpers.failed(
        ''.concat(`details - standard: ${this.standard}, `, `error message - ${error.message} `)
      )
    }

    console.group(`Common erc20LikeHelper >%c ${this.standard}`, 'color: red;')
    console.error('error: ', error)
    console.groupEnd()
  }

  getCurrentWeb3 = () => metamask.getWeb3() || this.Web3

  estimateFeeValue = async (params): Promise<number> => {
    const { method, swapABMethod } = params
    const gasPrice = await this.estimateGasPrice()
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

  estimateGasPrice = async (): Promise<number> => {
    return ethLikeHelper[this.currencyKey].estimateGasPrice()
  }

  isToken = (params): boolean => {
    const { name } = params

    return (
      Object.keys(config[this.standard]).includes(name.toLowerCase()) ||
      name.startsWith(`{${this.currencyKey}}`)
    )
  }

  checkAllowance = async (params: {
    tokenOwnerAddress: string
    tokenContractAddress: string
    decimals: number
  }): Promise<number> => {
    const { tokenOwnerAddress, tokenContractAddress, decimals } = params
    const Web3 = this.getCurrentWeb3()
    const tokenContract = new Web3.eth.Contract(TokenApi, tokenContractAddress, {
      from: tokenOwnerAddress,
    })

    let allowanceAmount = 0

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
      this.reportError({ error })
    }

    return allowanceAmount
  }
}

const isToken = (params) => {
  const { name } = params

  const isUTXOModel = COIN_DATA[name.toUpperCase()] && COIN_DATA[name.toUpperCase()].model === COIN_MODEL.UTXO
  if (isUTXOModel) return false

  for (const prop in TOKEN_STANDARDS) {
    const standard = TOKEN_STANDARDS[prop].standard
    const baseCurrency = TOKEN_STANDARDS[prop].currency
    const lowerName = name.toLowerCase()

    if (
      Object.keys(config[standard])?.includes(lowerName) ||
      lowerName.startsWith(`{${baseCurrency}}`)
    ) {
      return true
    }
  }

  return false
}

export default {
  isToken,
  erc20: new erc20LikeHelper({
    standard: 'erc20',
    currency: 'ETH',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(new Web3.providers.HttpProvider(config.web3.provider)),
  }),
  bep20: new erc20LikeHelper({
    standard: 'bep20',
    currency: 'BNB',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(new Web3.providers.HttpProvider(config.web3.binance_provider)),
  }),
  erc20matic: new erc20LikeHelper({
    standard: 'erc20matic',
    currency: 'MATIC',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(new Web3.providers.HttpProvider(config.web3.matic_provider)),
  }),
}