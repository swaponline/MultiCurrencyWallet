
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

  reportError = (error) => {
    feedback.helpers.failed(
      ''.concat(`details - currency: ${this.currency}, `, `error message - ${error.message} `)
    )
    console.group(`Common helpers >%c ${this.currency}`, 'color: red;')
    console.error('error: ', error)
    console.groupEnd()
  }

  estimateFeeValue = async (params) => {
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
  // TODO: will we use two methods or will better to use the same api ?
  estimateGasPrice = async (params) => {
    const { speed } = params
    const defaultPrice = this.defaultParams.price
  
    if (!this.feeRatesLink) {
      return this.defaultParams.price[speed]
    }
  
    let apiResult
  
    try {
      apiResult = await api.asyncFetchApi(this.feeRatesLink)
    } catch (error) {
      this.reportError(error)
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
      ? apiPrice.toString()
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
    feeRatesLink: config.feeRates.bnb,
  }),
}