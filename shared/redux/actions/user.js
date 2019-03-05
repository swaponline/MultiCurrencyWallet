import config from 'app-config'
import moment from 'moment/moment'
import { request, constants } from 'helpers'

import actions from 'redux/actions'
import { getState } from 'redux/core'

import reducers from 'redux/core/reducers'


const sign = async () => {
  const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
  // const bchPrivateKey = localStorage.getItem(constants.privateKeyNames.bch)
  const ltcPrivateKey = localStorage.getItem(constants.privateKeyNames.ltc)
  const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)
  const keychainActivated = localStorage.getItem(constants.localStorage.keychainActivated) === 'true'
  const _ethPrivateKey = keychainActivated ? await actions.eth.loginWithKeychain() : actions.eth.login(ethPrivateKey)
  // const xlmPrivateKey = localStorage.getItem(constants.privateKeyNames.xlm)

  // actions.xlm.login(xlmPrivateKey)
  actions.btc.login(btcPrivateKey)
  // actions.bch.login(bchPrivateKey)
  actions.usdt.login(btcPrivateKey)
  actions.ltc.login(ltcPrivateKey)

  // if inside actions.token.login to call web3.eth.accounts.privateKeyToAccount passing public key instead of private key
  // there will not be an error, but the address returned will be wrong
  if (!keychainActivated) {
    Object.keys(config.erc20)
      .forEach(name => {
        actions.token.login(_ethPrivateKey, config.erc20[name].address, name, config.erc20[name].decimals, config.erc20[name].fullName)
      })
  }
  // await actions.nimiq.login(_ethPrivateKey)

  const eosSign = async () => {
    const eosActivePrivateKey = localStorage.getItem(constants.privateKeyNames.eosPrivateKey)
    const eosActivePublicKey = localStorage.getItem(constants.privateKeyNames.eosPublicKey)
    const eosAccount = localStorage.getItem(constants.privateKeyNames.eosAccount)

    if (eosActivePrivateKey && eosActivePublicKey && eosAccount) {
      await actions.eos.login(eosAccount, eosActivePrivateKey, eosActivePublicKey)
      await actions.eos.waitAccountActivation()
    } else {
      await actions.eos.loginWithNewAccount()
    }

    await actions.eos.getBalance()
  }

  const telosSign = async () => {
    const telosActivePrivateKey = localStorage.getItem(constants.privateKeyNames.telosPrivateKey)
    const telosActivePublicKey = localStorage.getItem(constants.privateKeyNames.telosPublicKey)
    const telosAccount = localStorage.getItem(constants.privateKeyNames.telosAccount)

    if (telosActivePrivateKey && telosActivePublicKey && telosAccount) {
      actions.tlos.login(telosAccount, telosActivePrivateKey, telosActivePublicKey)
    }
    await actions.tlos.getBalance()
  }

  const getReputation = async () => {
    await actions.user.getReputation()
  }

  eosSign()
  telosSign()
  getReputation()
}

const getReputation = async () => {
  const btcReputationPromise = actions.btc.getReputation()
  const ethReputationPromise = actions.eth.getReputation()
  Promise.all([btcReputationPromise, ethReputationPromise])
    .then(([btcReputation, ethReputation]) => {
      const totalReputation = Number(btcReputation) + Number(ethReputation)
      if (Number.isInteger(totalReputation)) {
        reducers.ipfs.set({ reputation: totalReputation })
      } else {
        reducers.ipfs.set({ reputation: null })
      }
    }).catch((error) => {
      console.error(`unknown reputation`, error)
    })
}

const getBalances = () => {
  actions.eth.getBalance()
  actions.btc.getBalance()
  // actions.xlm.getBalance()
  // actions.bch.getBalance()
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
  /* //googe bitcoin (or rinkeby) faucet
  request.get('https://swap.wpmix.net/demokeys.php', {})
    .then((r) => {
      window.localStorage.clear()
      localStorage.setItem(constants.privateKeyNames.btc, r[0])
      localStorage.setItem(constants.privateKeyNames.eth, r[1])
      localStorage.setItem(constants.localStorage.demoMoneyReceived, true)
      window.location.reload()
    })
    */
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
    actions.usdt.getTransaction(),
    actions.eth.getTransaction(),
    actions.ltc.getTransaction(),
    ...Object.keys(config.erc20)
      .map(name => actions[name].getTransaction(name)),
  ])
    .then(transactions => {
      let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
      reducers.history.setTransactions(data)
    })

const getText = () => {
  const { user : { ethData, btcData, eosData, /* xlmData, */ telosData, /* bchData, */ ltcData } } = getState()


  let text = `
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
#LITECOIN
\r\n
Litecoin address: ${ltcData.address}  \r\n
Private key: ${ltcData.privateKey}\r\n
\r\n
1. Go to blockchain.info\r\n
2. login\r\n
3. Go to settings > addresses > import\r\n
4. paste private key and click "Ok"\r\n
\r\n
`
/*
# XLM\r\n
\r\n
XLM Private Key: ${xlmData.keypair.secret()}\r\n
Address name: ${xlmData.address}\r\n
\r\n
`
*/
  if (eosData.activePrivateKey) {
    text = `
${text}
# EOS\r\n
\r\n
EOS Master Private Key: ${eosData.activePrivateKey}\r\n
Account name: ${eosData.address}\r\n
\r\n
# TELOS\r\n
\r\n
TELOS Active Private Key: ${telosData.activePrivateKey}\r\n
Account name: ${telosData.address}\r\n`
  }

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

  localStorage.setItem(constants.localStorage.privateKeysSaved, true)
}

window.downloadPrivateKeys = downloadPrivateKeys

export default {
  sign,
  getBalances,
  getDemoMoney,
  getExchangeRate,
  setTransactions,
  downloadPrivateKeys,
  getText,
  getReputation,
}
