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
}
