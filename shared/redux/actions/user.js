import config from 'app-config'
import moment from 'moment/moment'
import { request, constants } from 'helpers'

import actions from 'redux/actions'
import { getState } from 'redux/core'

import reducers from 'redux/core/reducers'


const sign = async () => {
  const btcPrivateKey = localStorage.getItem(constants.privateKeyNames.btc)
  const btcMultisigPrivateKey = localStorage.getItem(constants.privateKeyNames.btcMultisig)
  const btcMultisigSMSOwnerKey = config.swapContract.protectedBtcKey
  const btcMultisigOwnerKey = localStorage.getItem(constants.privateKeyNames.btcMultisigOtherOwnerKey)
  const bchPrivateKey = localStorage.getItem(constants.privateKeyNames.bch)
  const ltcPrivateKey = localStorage.getItem(constants.privateKeyNames.ltc)
  const ethPrivateKey = localStorage.getItem(constants.privateKeyNames.eth)
  // const qtumPrivateKey        = localStorage.getItem(constants.privateKeyNames.qtum)
  // const xlmPrivateKey = localStorage.getItem(constants.privateKeyNames.xlm)

  const isEthKeychainActivated = !!localStorage.getItem(constants.privateKeyNames.ethKeychainPublicKey)
  const isBtcKeychainActivated = !!localStorage.getItem(constants.privateKeyNames.btcKeychainPublicKey)
  const isBtcMultisigKeychainActivated = !!localStorage.getItem(constants.privateKeyNames.btcMultisigKeychainPublicKey)

  const _ethPrivateKey = isEthKeychainActivated ? await actions.eth.loginWithKeychain() : actions.eth.login(ethPrivateKey)
  const _btcPrivateKey = isBtcKeychainActivated ? await actions.btc.loginWithKeychain() : actions.btc.login(btcPrivateKey)
  const _btcMultisigSMSPrivateKey = actions.btcmultisig.login_SMS(btcPrivateKey, btcMultisigSMSOwnerKey)
  const _btcMultisigPrivateKey = actions.btcmultisig.login_USER(btcPrivateKey, btcMultisigOwnerKey)

  actions.bch.login(bchPrivateKey)
  // actions.usdt.login(btcPrivateKey)
  actions.ltc.login(ltcPrivateKey)
  // actions.qtum.login(qtumPrivateKey)
  // actions.xlm.login(xlmPrivateKey)

  // if inside actions.token.login to call web3.eth.accounts.privateKeyToAccount passing public key instead of private key
  // there will not be an error, but the address returned will be wrong
  if (!isEthKeychainActivated) {
    Object.keys(config.erc20)
      .forEach(name => {
        actions.token.login(_ethPrivateKey, config.erc20[name].address, name, config.erc20[name].decimals, config.erc20[name].fullName)
      })
  }
  // await actions.nimiq.login(_ethPrivateKey)

  const getReputation = actions.user.getReputation()

  await getReputation()
}

const getReputation = async () => {
  const btcReputationPromise = actions.btc.getReputation()
  const ethReputationPromise = actions.eth.getReputation()

  Promise.all([
    btcReputationPromise,
    ethReputationPromise,
  ])
    .then(([btcReputation, ethReputation]) => {
      const totalReputation = Number(btcReputation) + Number(ethReputation)

      if (Number.isInteger(totalReputation)) {
        reducers.ipfs.set({ reputation: totalReputation })
      }
      else {
        reducers.ipfs.set({ reputation: null })
      }
    })
    .catch((error) => {
      console.error(`unknown reputation`, error)
    })
}

const getBalances = () => {
  actions.eth.getBalance()
  actions.btc.getBalance()
  actions.btcmultisig.getBalance() // SMS-Protected
  actions.btcmultisig.getBalanceUser() //Other user confirm
  actions.bch.getBalance()
  actions.ltc.getBalance()
  // actions.usdt.getBalance()
  // actions.qtum.getBalance()
  // actions.xlm.getBalance()

  Object.keys(config.erc20)
    .forEach(name => {
      actions.token.getBalance(name)
    })
  // actions.nimiq.getBalance()
}

const getDemoMoney = process.env.MAINNET ? () => { } : () => {
  // googe bitcoin (or rinkeby) faucet
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

    request.get(url).then(({ ticker: { price: exchangeRate } }) => {
      resolve(exchangeRate)
    })
      .catch(() => {
        if (constants.customEcxchangeRate[sellCurrency.toLowerCase()] !== undefined) {
          resolve(constants.customEcxchangeRate[sellCurrency])
        } else {
          resolve(1)
        }
      })
  })


const pullTransactions = transactions => {
  let data = [].concat([], ...transactions).sort((a, b) => b.date - a.date)
  reducers.history.setTransactions(data)
}

const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(true), ms))

const setTransactions = async () => {
  try {
    const mainTokens = await Promise.all([
      actions.btc.getTransaction(),
      actions.btc.getInvoices(),
      actions.btcmultisig.getTransactionSMS(),
      actions.btcmultisig.getInvoicesSMS(),
      actions.btcmultisig.getTransactionUser(),
      actions.btcmultisig.getInvoicesUser(),
      actions.bch.getTransaction(),
      // actions.usdt.getTransaction(),
      actions.eth.getTransaction(),
      actions.ltc.getTransaction(),
    ])

    await new Promise(async resolve => {
      const ercArray = await Promise.all(Object.keys(config.erc20)
        .map(async (name, index) => {
          await delay(650 * index)
          const res = await actions[name].getTransaction(name)
          // console.log('name - ', name, '\n', '\n', res)
          return res
        }))
      return resolve(ercArray)
    }).then((ercTokens) => {
      pullTransactions([...mainTokens, ...ercTokens])
    })
  } catch (error) {
    console.error('getTransError: ', error)
  }
}

const getText = () => {
  const { user: { ethData, btcData, /* xlmData, */bchData, ltcData } } = getState()


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
# BITCOINCASH\r\n
\r\n
Bitcoin Cash address: ${bchData.address}\r\n
Private key: ${bchData.privateKey}\r\n
\r\n
1. Go to blockchain.info\r\n
2. login\r\n
3. Go to settings > addresses > import\r\n
4. paste private key and click "Ok"\r\n
`
  /*
  # XLM\r\n
  \r\n
  XLM Private Key: ${xlmData.keypair.secret()}\r\n
  Address name: ${xlmData.address}\r\n
  \r\n
  `
  */

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
