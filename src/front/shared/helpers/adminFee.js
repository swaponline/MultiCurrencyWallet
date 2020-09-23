import getCurrencyKey from './getCurrencyKey'
import config from './externalConfig'
import { BigNumber } from 'bignumber.js'


const isEnabled = (currency) => {
  currency = getCurrencyKey(currency).toLowerCase()
  if (config && config.opts && config.opts.fee) {
    if ((currency === `token`) && config.opts.fee.erc20) {
      return config.opts.fee.erc20
    } else {
      if (config.opts.fee[currency]) {
        return config.opts.fee[currency]
      }
    }
  }

  return false
}

const calc = (currency, amount) => {
  const usedAdminFee = isEnabled(currency)

  if (usedAdminFee) {
    let fee = (usedAdminFee.min) ? BigNumber(usedAdminFee.min).toNumber() : 0

    if (amount && BigNumber(amount).isGreaterThan(0)) {
      let feeFromAmount = BigNumber(usedAdminFee.fee).dividedBy(100).multipliedBy(amount)
      if (BigNumber(usedAdminFee.min).isGreaterThan(feeFromAmount)) feeFromAmount = BigNumber(usedAdminFee.min)

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
