import config from 'app-config'
import moment from 'moment/moment'
import { request, constants } from 'helpers'

import actions from 'redux/actions'
import { getState } from 'redux/core'

import SwapApp from 'swap.app'
import reducers from 'redux/core/reducers'


const sign = async () => {
  const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
  const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)
  const _ethPrivateKey = actions.ethereum.login(ethPrivateKey)

  actions.bitcoin.login(btcPrivateKey)

  Object.keys(config.tokens)
    .forEach(name => {
      actions.token.login(_ethPrivateKey, config.tokens[name].address, name, config.tokens[name].decimals)
    })
  // await actions.nimiq.login(_ethPrivateKey)

  const eosMasterPrivateKey = localStorage.getItem(constants.privateKeyNames.eos)
  const eosAccount = localStorage.getItem(constants.privateKeyNames.eosAccount)
  if (eosMasterPrivateKey && eosAccount) {
    await actions.eos.init()
    await actions.eos.login(eosAccount, eosMasterPrivateKey)
    await actions.eos.getBalance()
  }
}

const getBalances = () => {
  actions.ethereum.getBalance()
  actions.bitcoin.getBalance()
  actions.eos.getBalance()

  Object.keys(config.tokens)
    .forEach(name => {
      actions.token.getBalance(config.tokens[name].address, name, config.tokens[name].decimals)
    })
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

const setExchangeRate = (sellCurrency, buyCurrency, setState) => {
  let url

  if (sellCurrency === 'btc') {
    url = `https://api.cryptonator.com/api/full/${buyCurrency}-btc`
  } else {
    url = `https://api.cryptonator.com/api/full/${sellCurrency}-btc`
  }

  console.log('rate', url)
  return request.get(url)
    .then(({ ticker: { price: exchangeRate } })  => {
      console.log('rate', exchangeRate)
      setState(exchangeRate)
    })
    .catch(() =>
      setState(config.exchangeRates[`${sellCurrency.toLowerCase()}btc`])
    )
}

const setTransactions = () =>
  Promise.all([
    actions.bitcoin.getTransaction(),
    actions.ethereum.getTransaction(),
    actions.token.getTransaction(config.tokens.swap.address),
    actions.token.getTransaction(config.tokens.noxon.address),
  ])
    .then(transactions => {
      let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
      reducers.history.setTransactions(data)
    })

const getText = () => {
  const { user : { ethData, btcData, eosData } } = getState()


  const text = `
${window.location.hostname} emergency instruction
\r\n
\r\n
#ETHEREUM
\r\n
\r\n
Ethereum address: ${ethData.address}  \r\n
Private key: ${ethData.privateKey}\r\n
\r\n
\r\n
How to access tokens and ethers: \r\n
1. Go here https://www.myetherwallet.com/#send-transaction \r\n
2. Select 'Private key'\r\n
3. paste private key to input and click "unlock"\r\n
\r\n
\r\n
\r\n
# BITCOIN\r\n
\r\n
\r\n
Bitcoin address: ${btcData.address}\r\n
Private key: ${btcData.privateKey}\r\n
\r\n
\r\n
1. Go to blockchain.info\r\n
2. login\r\n
3. Go to settings > addresses > import\r\n
4. paste private key and click "Ok"\r\n
\r\n
\r\n
* We don\`t store your private keys and will not be able to restore them!  
\r\n
\r\n
\r\n
# EOS\r\n
\r\n
EOS Master Private Key: ${eosData.masterPrivateKey}\r\n
Account name: ${eosData.address}\r\n
`

  return text
}

const downloadPrivateKeys = () => {
  const element = document.createElement('a')
  const text = getText()
  const message = 'Check your browser downloads'

  element.setAttribute('href', `data:text/plaincharset=utf-8,${encodeURIComponent(text)}`)
  element.setAttribute('download', `${window.location.hostname}_keys_${moment().format('DD.MM.YYYY')}.txt`)

  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)

  actions.notifications.show(constants.notifications.Message, {
    message,
  })
}

const getSwapHistory = () => {
  const swapId = JSON.parse(localStorage.getItem('swapId'))

  if (swapId === null || swapId.length === 0) {
    return
  }

  const historySwap = swapId.map(item => ({
    ...SwapApp.env.storage.getItem(`swap.${item}`),
    ...SwapApp.env.storage.getItem(`flow.${item}`),
  }))
  reducers.history.setSwapHistory(historySwap)
}


export default {
  sign,
  getBalances,
  getDemoMoney,
  getSwapHistory,
  setExchangeRate,
  setTransactions,
  downloadPrivateKeys,
}
