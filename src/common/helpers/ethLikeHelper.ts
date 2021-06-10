
import config from 'app-config'
import { BigNumber } from 'bignumber.js'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import { feedback, api } from 'helpers'

class ethLikeHelper {
  readonly currency: string
  readonly currencyKey: string
  readonly defaultParams: IUniversalObj
  readonly feeRatesLink: string

  constructor(params) {
    const {
      currency,
      defaultParams,
      feeRatesLink,
    } = params

    this.currency = currency
    this.currencyKey = currency.toLowerCase()
    this.defaultParams = defaultParams
    this.feeRatesLink = feeRatesLink
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
    let apiResult

    try {
      // returned in hex wei value
      apiResult = await api.asyncFetchApi(this.feeRatesLink)
    } catch (err) {
      return this.defaultParams.price.fast
    }

    // convert to decimal value
    const weiGasPrice = new BigNumber(parseInt(apiResult.result).toString(10))

    return weiGasPrice.isGreaterThan(this.defaultParams.price.fast)
      ? weiGasPrice.toNumber()
      : this.defaultParams.price.fast
  }
}

export default {
  eth: new ethLikeHelper({
    currency: 'ETH',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    feeRatesLink: config.feeRates.eth,
  }),
  bnb: new ethLikeHelper({
    currency: 'BNB',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    feeRatesLink: config.feeRates.bsc,
  }),
  matic: new ethLikeHelper({
    currency: 'MATIC',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.evmLike,
    feeRatesLink: config.feeRates.matic,
  }),
}