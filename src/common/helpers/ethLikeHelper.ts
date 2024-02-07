import config from 'app-config'
import Web3 from 'web3'
import { BigNumber } from 'bignumber.js'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import { feedback } from 'helpers'

class ethLikeHelper {
  readonly currency: string
  readonly currencyKey: string
  readonly defaultParams: IUniversalObj
  readonly web3: IUniversalObj

  constructor(params) {
    const { currency, defaultParams, web3 } = params

    this.currency = currency
    this.currencyKey = currency.toLowerCase()
    this.defaultParams = defaultParams
    this.web3 = web3
  }

  reportError = (params) => {
    const { error, sendFeedback = false } = params

    if (sendFeedback) {
      feedback.helpers.failed(
        ''.concat(`details - currency: ${this.currency}, `, `error message - ${error.message} `)
      )
    }

    console.group(`Common helpers >%c ${this.currency}`, 'color: red;')
    console.error('error: ', error)
    console.groupEnd()
  }

  estimateFeeValue = async (params): Promise<number> => {
    const { method } = params
    const gasPrice = await this.estimateGasPrice()
    const defaultGasLimit = this.defaultParams.limit[method]
    const theSmallestPart = 1e-18

    return new BigNumber(defaultGasLimit)
      .multipliedBy(gasPrice)
      .multipliedBy(theSmallestPart)
      .toNumber()
  }

  estimateGasPrice = async (): Promise<number> => {
    if (this.defaultParams.price_fixed) return this.defaultParams.price_fixed

    let response

    try {
      response = await this.web3.eth.getGasPrice()
    } catch (err) {
      return this.defaultParams.price.fast
    }

    const weiGasPrice = new BigNumber(response)

    return weiGasPrice.isGreaterThan(this.defaultParams.price.fast)
      ? weiGasPrice.toNumber()
      : this.defaultParams.price.fast
  }

  getContract = (params) => {
    const { address, abi } = params

    return new this.web3.eth.Contract(abi, address)
  }
}

export default {
  eth: new ethLikeHelper({
    currency: 'ETH',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.provider),
  }),
  bnb: new ethLikeHelper({
    currency: 'BNB',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.binance_provider),
  }),
  matic: new ethLikeHelper({
    currency: 'MATIC',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.matic_provider),
  }),
  arbeth: new ethLikeHelper({
    currency: 'ARBETH',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.arbeth,
    web3: new Web3(config.web3.arbitrum_provider),
  }),
  aureth: new ethLikeHelper({
    currency: 'AURETH',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.aureth,
    web3: new Web3(config.web3.aurora_provider),
  }),
  xdai: new ethLikeHelper({
    currency: 'XDAI',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.xdai_provider),
  }),
  ftm: new ethLikeHelper({
    currency: 'FTM',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.ftm_provider),
  }),
  avax: new ethLikeHelper({
    currency: 'AVAX',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.avax_provider),
  }),
  movr: new ethLikeHelper({
    currency: 'MOVR',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.movr_provider),
  }),
  one: new ethLikeHelper({
    currency: 'ONE',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.one_provider),
  }),
  ame: new ethLikeHelper({
    currency: 'AME',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    web3: new Web3(config.web3.ame_provider),
  }),
  phi_v1: new ethLikeHelper({
    currency: 'PHI_V1',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.phi_v1,
    web3: new Web3(config.web3.phi_v1_provider),
  }),
  phi: new ethLikeHelper({
    currency: 'PHI',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.phi,
    web3: new Web3(config.web3.phi_provider),
  }),
  fkw: new ethLikeHelper({
    currency: 'FKW',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.fkw,
    web3: new Web3(config.web3.fkw_provider),
  }),
  phpx: new ethLikeHelper({
    currency: 'PHPX',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.phpx,
    web3: new Web3(config.web3.phpx_provider),
  }),
}
