import reducers from 'redux/core/reducers'
import config from 'app-config'
import { ethKeyToKeyPair, followTransaction, prepareTransaction } from 'helpers/nimiq'


const $ = {}
let initNimiqPromise
let isNimiqInitialized = false
let initPromise
let isInitialized = false

const NETWORK = config.entry === 'mainnet' ? 'main' : 'test'


const initNimiq = async () => {
  if (initNimiqPromise) {
    return initNimiqPromise
  }
  else if (isNimiqInitialized) {
    return Promise.resolve()
  }

  initNimiqPromise = new Promise((resolve, reject) => {
    if (!window.Nimiq) {
      console.error('Nimiq not present, add from CDN: https://cdn.nimiq.com/nimiq.js')
      reject()
    }
    else {
      window.Nimiq.init(() => {
        isNimiqInitialized = true
        window.Nimiq.GenesisConfig.init(window.Nimiq.GenesisConfig.CONFIGS[NETWORK])
        resolve()
      })
    }
  })

  return initNimiqPromise
}

async function initWallet(privateKey) {
  const keyPair = ethKeyToKeyPair(privateKey)

  return new window.Nimiq.Wallet(keyPair)
}

async function init() {
  await initNimiq()

  if (initPromise) {
    return initPromise
  }
  else if (isInitialized) {
    return Promise.resolve()
  }

  initPromise = new Promise(async (resolve) => {
    window.nim = $

    $.consensus   = await window.Nimiq.Consensus.nano()
    $.blockchain  = $.consensus.blockchain
    $.accounts    = $.blockchain.accounts
    $.mempool     = $.consensus.mempool
    $.network     = $.consensus.network

    $.consensus.on('established', () => {
      window.Nimiq.Log.i('Consensus', `Current state: height=${$.blockchain.height}, headHash=${$.blockchain.headHash}`)
      resolve()
    })
    $.network.connect()
  })

  return initPromise
}

const login = async (ethPrivateKey) => {
  await init()

  $.wallet = await initWallet(ethPrivateKey)

  const data = {
    balance: 0,
    address: $.wallet.address.toUserFriendlyAddress(),
  }

  window.getNimAddress = () => data.address

  console.info('Logged in with Nimiq', data)
  reducers.user.setAuthData({ name: 'nimData', data })

  return data
}

const getBalance = async () => {
  await init()

  const account = await $.consensus.getAccount($.wallet.address)
  const amount = window.Nimiq.Policy.satoshisToCoins(account.balance).toFixed(0)

  reducers.user.setBalance({ name: 'nimData', amount })

  return amount
}

const getTransaction = () => {}

const send = async (from, address, amount) => {
  await init()

  const { addr, value, fee, height } = prepareTransaction($, address, amount)
  const tx = $.wallet.createTransaction(addr, value, fee, height)

  $.consensus.relayTransaction(tx)
  $.consensus.subscribeAccounts([tx.recipient])

  window.Nimiq.Log.i('TX', `Waiting for Nimiq transaction [${tx.hash().toHex()}] to confirm, please wait...`)

  followTransaction($, tx)
    .then(() => window.Nimiq.Log.i('TX', `Nimiq transaction [${tx.hash().toHex()}] confirmed!`))
    .then(() => getBalance())

  return tx
}


export default {
  login,
  getBalance,
  getTransaction,
  send,
}
