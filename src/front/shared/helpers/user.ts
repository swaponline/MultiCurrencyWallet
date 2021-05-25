import config from 'app-config'
import store from 'redux/store'
import TOKEN_STANDARDS from 'helpers/constants/TOKEN_STANDARDS'

export const getActivatedCurrencies = () => {
  const currencies: string[] = []

  if (!config.opts.curEnabled || config.opts.curEnabled.btc) {
    currencies.push('BTC')
    currencies.push('BTC (SMS-Protected)')
    currencies.push('BTC (PIN-Protected)')
    currencies.push('BTC (Multisig)')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.eth) {
    currencies.push('ETH')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.bnb) {
    currencies.push('BNB')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.ghost) {
    currencies.push('GHOST')
  }

  if (!config.opts.curEnabled || config.opts.curEnabled.next) {
    currencies.push('NEXT')
  }

  Object.keys(TOKEN_STANDARDS).forEach((key) => {
    const standard = TOKEN_STANDARDS[key].standard

    Object.keys(config[standard]).forEach((token) => {
      currencies.push(token.toUpperCase())
    })
  })

  return currencies
}

export const filterUserCurrencyData = (currencyData) => {
  const { core: { hiddenCoinsList } } = store.getState()
  const enabledCurrencies = getActivatedCurrencies()
  const filteredData = {}

  function isAllowed(target): boolean {
    return (
      (!hiddenCoinsList.includes(target.currency) &&
        !hiddenCoinsList.includes(`${target.currency}:${target.address}`) &&
        enabledCurrencies.includes(target.currency)
      ) || target.balance > 0
    )
  }

  for (let dataKey in currencyData) {
    const dataItem = currencyData[dataKey]

    // filter a nested tokens data
    if ( Object.keys(TOKEN_STANDARDS).includes(dataKey) ) { 
      for (let tokenKey in dataItem) {
        const token = dataItem[tokenKey]

        if ( isAllowed(token) ) {
          filteredData[dataKey] = {
            ...filteredData[dataKey],
            [tokenKey]: token
          }
        }
      }
    } else if ( isAllowed(dataItem) ) {
      filteredData[dataKey] = dataItem
    }
  }

  return filteredData
}

export const flattenUserCurrencyData = (currencyData) => {
  const finalData: IUniversalObj[] = []

  Object.keys(currencyData).map((dataKey) => {
    const dataItem = currencyData[dataKey]

    if ( Object.keys(TOKEN_STANDARDS).includes(dataKey) ) {
      Object.keys(dataItem).forEach((tokenName) => {
        finalData.push(dataItem[tokenName])
      })
    } else {
      finalData.push(dataItem)
    }
  })

  return finalData
}