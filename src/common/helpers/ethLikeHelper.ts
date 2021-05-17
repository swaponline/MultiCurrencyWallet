
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
      currencyKey,
      defaultParams,
      feeRatesLink,
    } = params

    this.currency = currency
    this.currencyKey = currencyKey
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
    const { method, speed } = params
    const gasPrice = await this.estimateGasPrice({ speed })
    const defaultGasLimit = this.defaultParams.limit[method]
    const theSmallestPart = 1e-18
  
    return new BigNumber(defaultGasLimit)
      .multipliedBy(gasPrice)
      .multipliedBy(theSmallestPart)
      .toNumber()
  }

  // TODO: BNB has different calculation
  // TODO: ? > temporarily < solution for BNB. Will we use the same api for ETH ?
  estimateGasPriceForBnb = async (): Promise<number> => {
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

  estimateGasPrice = async (params): Promise<number> => {
    const { speed } = params
    const defaultPrice = this.defaultParams.price
  
    let apiResult

    if (this.currency === 'BNB') {
      return this.estimateGasPriceForBnb()
    }
  
    try {
      apiResult = await api.asyncFetchApi(this.feeRatesLink)
    } catch (error) {
      this.reportError({ error })
      return defaultPrice[speed]
    }
  
    const apiSpeeds = {
      slow: 'safeLow',
      fast: 'fast',
      fastest: 'fastest',
    }
  
    const apiSpeed = apiSpeeds[speed] || apiSpeeds.fast
    /* 
    * api returns gas price in x10 Gwei
    * divided by 10 to convert it to gwei
    */
    const apiPrice = new BigNumber(apiResult[apiSpeed]).dividedBy(10).multipliedBy(1e9)
  
    return apiPrice >= defaultPrice[speed] 
      ? apiPrice.toNumber()
      : defaultPrice[speed]
  }
}

export default {
  eth: new ethLikeHelper({
    currency: 'ETH',
    currencyKey: 'eth',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.eth,
    feeRatesLink: config.feeRates.eth,
  }),
  bnb: new ethLikeHelper({
    currency: 'BNB',
    currencyKey: 'bnb',
    defaultParams: DEFAULT_CURRENCY_PARAMETERS.bnb,
    feeRatesLink: config.feeRates.bsc,
  }),
}