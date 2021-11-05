import { BigNumber } from 'bignumber.js'

// prevent numbers from scientific notation
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

const formatWithDecimals = (amount, decimals): string => {
  return new BigNumber(amount)
    .times(10 ** decimals)
    .dp(decimals)
    .toString()
}

const formatWithoutDecimals = (amount, decimals): string => {
  return new BigNumber(amount)
    .div(10 ** decimals)
    .dp(decimals)
    .toString()
}

const toHexNumber = (amount: number | string | BigNumber): string => {
  return `0x${new BigNumber(amount).toString(16)}`
}

export default {
  formatWithDecimals,
  formatWithoutDecimals,
  toHexNumber,
}
