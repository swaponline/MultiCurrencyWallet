import Web3 from 'web3'
import config from 'app-config'
import TokenAbi from 'human-standard-token-abi'
import { BigNumber } from 'bignumber.js'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'
import { COIN_DATA, COIN_MODEL } from 'swap.app/constants/COINS'
import ethLikeHelper from 'common/helpers/ethLikeHelper'
import utils from 'common/utils'
import { feedback, metamask } from 'helpers'
import getCoinInfo from 'common/coins/getCoinInfo'


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
    const {
      coin,
      blockchain,
    } = getCoinInfo(name)

    if (!blockchain) return false
    return (
      Object.keys(config[this.standard]).includes(coin.toLowerCase()) &&
      name.startsWith(`{${this.currencyKey}}`)
    )
  }

  checkAllowance = async (params: {
    owner: string
    spender: string
    contract: string
    decimals: number
  }): Promise<number> => {
    const { owner, spender, contract, decimals } = params
    const Web3 = this.getCurrentWeb3()
    const tokenContract = new Web3.eth.Contract(TokenAbi, contract, {
      from: owner,
    })

    let allowanceAmount = 0

    try {
      allowanceAmount = await tokenContract.methods.allowance(owner, spender).call({ from: owner })
      allowanceAmount = new BigNumber(
        utils.amount.formatWithoutDecimals(allowanceAmount, decimals)
      ).toNumber()
    } catch (error) {
      this.reportError({ error })
    }

    return allowanceAmount
  }
}

const isToken = (params) => {
  const { name } = params
  const {
    coin: coinName,
    blockchain,
  } = getCoinInfo(name)

  if (!blockchain) return false

  const isUTXOModel = COIN_DATA[name.toUpperCase()] && COIN_DATA[name.toUpperCase()].model === COIN_MODEL.UTXO
  if (isUTXOModel) return false

  for (const prop in TOKEN_STANDARDS) {
    const standard = TOKEN_STANDARDS[prop].standard

    if (!config[standard]) continue

    const baseCurrency = TOKEN_STANDARDS[prop].currency
    const lowerName = coinName.toLowerCase()

    if (
      Object.keys(config[standard])?.includes(lowerName) &&
      name.toLowerCase().startsWith(`{${baseCurrency}}`)
    ) {
      return true
    }
  }

  return false
}

const providers = config.web3

export default {
  isToken,
  erc20: new erc20LikeHelper({
    standard: 'erc20',
    currency: 'ETH',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.provider),
  }),
  bep20: new erc20LikeHelper({
    standard: 'bep20',
    currency: 'BNB',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.binance_provider),
  }),
  erc20matic: new erc20LikeHelper({
    standard: 'erc20matic',
    currency: 'MATIC',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.matic_provider),
  }),
  erc20xdai: new erc20LikeHelper({
    standard: 'erc20xdai',
    currency: 'XDAI',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.xdai_provider),
  }),
  erc20ftm: new erc20LikeHelper({
    standard: 'erc20ftm',
    currency: 'FTM',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.ftm_provider),
  }),
  erc20avax: new erc20LikeHelper({
    standard: 'erc20avax',
    currency: 'AVAX',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.avax_provider),
  }),
  erc20movr: new erc20LikeHelper({
    standard: 'erc20movr',
    currency: 'MOVR',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.movr_provider),
  }),
  erc20one: new erc20LikeHelper({
    standard: 'erc20one',
    currency: 'ONE',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.one_provider),
  }),
  erc20aurora: new erc20LikeHelper({
    standard: 'erc20aurora',
    currency: 'AURETH',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.aurora_provider),
  }),
  erc20ame: new erc20LikeHelper({
    standard: 'erc20ame',
    currency: 'AME',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.ame_provider),
  }),
  phi20_v1: new erc20LikeHelper({
    standard: 'phi20_v1',
    currency: 'phi_v1',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.phi_provider),
  }),
  phi20: new erc20LikeHelper({
    standard: 'phi20',
    currency: 'phi',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.phi_provider),
  }),
  fkw20: new erc20LikeHelper({
    standard: 'fkw20',
    currency: 'fkw',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.fkw_provider),
  }),
  phpx20: new erc20LikeHelper({
    standard: 'phpx20',
    currency: 'phpx',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLikeToken,
    web3: new Web3(providers.phpx_provider),
  }),
}
