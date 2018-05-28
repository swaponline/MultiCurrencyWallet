import reducers from 'redux/core/reducers'
import config from 'app-config'
import { ethKeyToKeyPair, followTransaction, prepareTransaction } from 'helpers/nimiq'

const $ = {}
let _loading, _Nimiq

async function initNimiq(network = 'test') {
  if (_Nimiq) return _Nimiq
  if (!Nimiq) throw new Error('Nimiq not present, add from CDN: https://cdn.nimiq.com/nimiq.js')


  _Nimiq = new Promise( resolve => {

    Nimiq.init(() => {

      let CONFIG = Nimiq.GenesisConfig.CONFIGS[network]
      Nimiq.GenesisConfig.init(CONFIG)

      resolve(true)
    })
  })

  return _Nimiq
}

async function initWallet(privateKey) {
  await initNimiq()

  let keyPair = ethKeyToKeyPair(privateKey)
  return new Nimiq.Wallet(keyPair)
}

async function init() {
  await initNimiq()

  if (_loading) return _loading

  _loading = new Promise(async (resolve) => {
    window.nim = $

    $.consensus = await Nimiq.Consensus.nano()

    $.blockchain = $.consensus.blockchain
    $.mempool = $.consensus.mempool
    $.network = $.consensus.network

    $.consensus.on('established', () => resolve())

    $.network.connect()
  })

  return _loading
}


const login = async (ethPrivateKey) => {
  const NETWORK = config.entry === 'mainnet' ? 'main' : 'test'

  await initNimiq(NETWORK)

  $.wallet = await initWallet(ethPrivateKey)

  init()
    .then( () => Nimiq.Log.i('Consensus', `Current state: height=${$.blockchain.height}, headHash=${$.blockchain.headHash}`))
    .then( () => getBalance() )

  let data = {
    balance: 0,
    address: $.wallet.address.toUserFriendlyAddress()
  }

  console.info('Logged in with Nimiq', data)
  reducers.user.setAuthData({ name: 'nimData', data })

  return data
}

const getBalance = async (address) => {
  await init()

  let account = await $.consensus.getAccount($.wallet.address)
  let amount = Nimiq.Policy.satoshisToCoins(account.balance).toFixed(0)

  reducers.user.setBalance({ name: 'nimData', amount })

  return amount
}

const getTransaction = () => {}
const send = async (from, address, amount) => {
  await init()

  let { addr, value, fee, height } = prepareTransaction($, address, amount)

  let tx = $.wallet.createTransaction(addr, value, fee, height)

  $.consensus.relayTransaction(tx)
  $.consensus.subscribeAccounts([tx.recipient])

  Nimiq.Log.i('TX', `Waiting for Nimiq transaction [${tx.hash().toHex()}] to confirm, please wait...`)

  followTransaction($, tx)
    .then( () => Nimiq.Log.i('TX', `Nimiq transaction [${tx.hash().toHex()}] confirmed!`) )
    .then( () => getBalance() )

  return tx
}

export default {
  login,
  getBalance,
  getTransaction,
  send,
}
