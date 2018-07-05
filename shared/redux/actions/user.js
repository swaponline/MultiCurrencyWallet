import { request, constants } from 'helpers'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import config from 'app-config'


const sign = async () => {
  const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
  const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)
  const _ethPrivateKey = actions.ethereum.login(ethPrivateKey)

  actions.bitcoin.login(btcPrivateKey)

  Object.keys(config.services.tokens)
    .forEach(name => {
      actions.token.login(_ethPrivateKey, config.services.tokens[name].address, name, config.services.tokens[name].decimals)
    })
  // await actions.nimiq.login(_ethPrivateKey)

  // const eosMasterPrivateKey = localStorage.getItem(constants.privateKeyNames.eos)
  // await actions.eos.login(eosMasterPrivateKey)
}

const getBalances = () => {
  actions.ethereum.getBalance()
  actions.bitcoin.getBalance()

  Object.keys(config.services.tokens)
    .forEach(name => {
      actions.token.getBalance(config.services.tokens[name].address, name, config.services.tokens[name].decimals)
    })
  // actions.eos.getBalance()
  // actions.nimiq.getBalance()
}

const getDemoMoney = process.env.MAINNET ? () => {} : () => {
  request.get('https://swap.wpmix.net/demokeys.php', {})
    .then((r) => {
      window.localStorage.clear()
      localStorage.setItem(constants.privateKeyNames.btc, r[0])
      localStorage.setItem(constants.privateKeyNames.eth, r[1])
      localStorage.setItem(constants.localStorage.demoMoneyReceived, true)
    })
}

const setExchangeRate = (buyCurrency, sellCurrency) => {
  const url = `https://api.coinbase.com/v2/exchange-rates?currency=${buyCurrency.toUpperCase()}`

  return request.get(url)
    .then(({ data: { rates } })  =>
      Object.keys(rates)
        .filter(k => k === sellCurrency.toUpperCase())
        .map((k) => rates[k])
    ).catch(() =>
      config.exchangeRates[`${buyCurrency.toLowerCase()}${sellCurrency.toLowerCase()}`]
    )
}

const setTransactions = () =>
  Promise.all([
    actions.bitcoin.getTransaction(),
    actions.ethereum.getTransaction(),
    actions.token.getTransaction(config.services.tokens.swap.address),
    actions.token.getTransaction(config.services.tokens.noxon.address),
  ])
    .then(transactions => {
      let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
      reducers.history.setTransactions(data)
    })


export default {
  sign,
  getBalances,
  getDemoMoney,
  setExchangeRate,
  setTransactions,
}
