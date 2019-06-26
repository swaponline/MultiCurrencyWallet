export const hasNonZeroBalance = (currencies) => {
  const nonZeroBalanceCurrencies =
    currencies.filter(currency => currency.balance > 0)

  return nonZeroBalanceCurrencies.length > 0
}

export const hasSignificantBalance = (currencies) =>
  currencies
    .reduce((accumulator, { name, balance }) => {

      if (accumulator) return true

      // 10$
      if (name === 'BTC' && balance > 0.005) {
        return true
      }

      // 10$
      if (name === 'ETH' && balance > 0.1) {
        return true
      }

      return false
    }, false)

export const notTestUnit = (currencies) =>
  currencies
    .filter(
      ({ name, balance }) =>
        (name === 'ETH' && balance > 0.001) || (name === 'SWAP' && balance > 5))
    .length === 2
