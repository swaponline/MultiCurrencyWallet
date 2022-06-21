import { BigNumber } from 'bignumber.js'
import getCoinInfo from 'common/coins/getCoinInfo'
import getCurrencyKey from './getCurrencyKey'
import config from './externalConfig'
import TOKEN_STANDARDS, { EXISTING_STANDARDS } from './constants/TOKEN_STANDARDS'

const isEnabled = (currency) => {
  const currencyKey = getCurrencyKey(currency, false).toLowerCase()

  if (config?.opts?.fee) {
    if (currencyKey === `token`) {
      return getStandardFee(currency)
    }
    if (config.opts.fee[currencyKey]) {
      return config.opts.fee[currencyKey]
    }

  }

  return false
}

const getStandardFee = (token: string) => {
  const { blockchain: tokenBaseCurrency } = getCoinInfo(token)

  let tokenFee = false

  if (!tokenBaseCurrency) return tokenFee

  EXISTING_STANDARDS.forEach((standard) => {
    const baseCurrency = TOKEN_STANDARDS[standard].currency.toUpperCase()
    const standardFee = config.opts.fee[standard]

    if (
      baseCurrency === tokenBaseCurrency
      && standardFee?.min
      && standardFee.fee
      && standardFee.address
    ) tokenFee =  standardFee
  })

  return tokenFee
}

const calc = (currency, amount) => {
  const usedAdminFee = isEnabled(currency)

  if (usedAdminFee) {
    let fee = (usedAdminFee.min) ? new BigNumber(usedAdminFee.min).toNumber() : 0

    if (amount && new BigNumber(amount).isGreaterThan(0)) {
      let feeFromAmount = new BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount)

      if (new BigNumber(usedAdminFee.min).isGreaterThan(feeFromAmount)) feeFromAmount = new BigNumber(usedAdminFee.min)

      fee = feeFromAmount.toNumber() // Admin fee in satoshi
    }

    return fee
  }

  return 0
}

export default {
  isEnabled,
  calc,
}
