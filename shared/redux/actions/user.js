import config from 'app-config'
import moment from 'moment/moment'
import { request, constants } from 'helpers'

import actions from 'redux/actions'
import { getState } from 'redux/core'

import reducers from 'redux/core/reducers'


const sign = async () => {
  const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
  const bchPrivateKey = localStorage.getItem(constants.privateKeyNames.bch)
  const ltcPrivateKey = localStorage.getItem(constants.privateKeyNames.ltc)
  const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)
  const _ethPrivateKey = actions.eth.login(ethPrivateKey)

  actions.btc.login(btcPrivateKey)
  actions.bch.login(bchPrivateKey)
  actions.usdt.login(btcPrivateKey)
  actions.ltc.login(ltcPrivateKey)

  Object.keys(config.erc20)
    .forEach(name => {
      actions.token.login(_ethPrivateKey, config.erc20[name].address, name, config.erc20[name].decimals)
    })
  // await actions.nimiq.login(_ethPrivateKey)

  const eosActivePrivateKey = localStorage.getItem(constants.privateKeyNames.eos)
  const eosAccount = localStorage.getItem(constants.privateKeyNames.eosAccount)

  if (eosActivePrivateKey && eosAccount) {
    await actions.eos.login(eosAccount, eosActivePrivateKey)
  } else {
    await actions.eos.loginWithNewAccount()
  }

  await actions.eos.getBalance()

  const telosActivePrivateKey = localStorage.getItem(constants.privateKeyNames.telos)
  const telosAccount = localStorage.getItem(constants.privateKeyNames.telosAccount)
  if (telosActivePrivateKey && telosAccount) {
    await actions.tlos.login(telosAccount, telosActivePrivateKey)
    await actions.tlos.getBalance()
  }
}

const getBalances = () => {
  actions.eth.getBalance()
  actions.btc.getBalance()
  actions.bch.getBalance()
  actions.ltc.getBalance()
  actions.usdt.getBalance()
  actions.eos.getBalance()
  actions.tlos.getBalance()

  Object.keys(config.erc20)
    .forEach(name => {
      actions.token.getBalance(name)
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
      window.location.reload()
    })
}

const getExchangeRate = (sellCurrency, buyCurrency) =>
  new Promise((resolve, reject) => {
    const url = `https://api.cryptonator.com/api/full/${sellCurrency}-${buyCurrency}`

    request.get(url).then(({ ticker: { price: exchangeRate } })  => {
      resolve(exchangeRate)
    })
      .catch(() => {
        resolve(1)
      })
  })

const setTransactions = () =>
  Promise.all([
    actions.btc.getTransaction(),
    actions.eth.getTransaction(),
    // actions.ltc.getTransaction(),
    ...Object.keys(config.erc20)
      .map(name => actions[name].getTransaction(name)),
  ])
    .then(transactions => {
      let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
      reducers.history.setTransactions(data)
    })

const getText = () => {
  const { user : { ethData, btcData, eosData, telosData, bchData, ltcData } } = getState()


  const text = `
  You will need this instruction only in case of emergency (if you lost your keys) \r\n
  please do NOT waste your time and go back to swap.online\r\n
  \r\n
  \r\n
  \r\n
  \r\n
${window.location.hostname} emergency only instruction
\r\n
#ETHEREUM
\r\n
Ethereum address: ${ethData.address}  \r\n
Private key: ${ethData.privateKey}\r\n
\r\n
How to access tokens and ethers: \r\n
1. Go here https://www.myetherwallet.com/#send-transaction \r\n
2. Select 'Private key'\r\n
3. paste private key to input and click "unlock"\r\n
\r\n
# BITCOIN\r\n
\r\n
Bitcoin address: ${btcData.address}\r\n
Private key: ${btcData.privateKey}\r\n
\r\n
1. Go to blockchain.info\r\n
2. login\r\n
3. Go to settings > addresses > import\r\n
4. paste private key and click "Ok"\r\n
\r\n
* We don\`t store your private keys and will not be able to restore them!
\r\n
# EOS\r\n
\r\n
EOS Master Private Key: ${eosData.masterPrivateKey}\r\n
Account name: ${eosData.address}\r\n
\r\n
# TELOS\r\n
\r\n
TELOS Active Private Key: ${telosData.activePrivateKey}\r\n
Account name: ${telosData.address}\r\n

#BITCOIN CASH\r\n
\r\n
BitcoinCash address: ${bchData.address}  \r\n
Private key: ${bchData.privateKey}\r\n
\r\n
1. Go to blockchain.info
2. login
3. Go to settings > addresses > import
4. paste private key and click "Ok"
\r\n
#LITECOIN
\r\n
Litecoin address: ${ltcData.address}  \r\n
Private key: ${ltcData.privateKey}\r\n
\r\n
1. Go to blockchain.info
2. login
3. Go to settings > addresses > import
4. paste private key and click "Ok"
\r\n
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

window.downloadPrivateKeys = downloadPrivateKeys

export default {
  sign,
  getBalances,
  getDemoMoney,
  getExchangeRate,
  setTransactions,
  downloadPrivateKeys,
}
