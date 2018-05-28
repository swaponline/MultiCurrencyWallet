const $ = {}
let _loading, _Nimiq

async function initNimiq(network = 'test') {
  if (_Nimiq) return _Nimiq
  if (!Nimiq) throw new Error('Nimiq not present, add from CDN: https://cdn.nimiq.com/nimiq.js')

  _Nimiq = new Promise( resolve => {
    Nimiq.init(async function () {
      console.info('Logged in with Nimiq')
      Nimiq.GenesisConfig.init(Nimiq.GenesisConfig.CONFIGS[network])
      resolve(true)
    })
  })

  return _Nimiq
}

async function login(privateKey, network) {
  await initNimiq(network)

  $.wallet = await initWallet(privateKey)

  init().then( () => getBalance() )

  let data = {
    balance: 0,
    address: $.wallet.address.toUserFriendlyAddress()
  }

  return data
}

async function initWallet(privateKey) {
  await initNimiq()

  let keyPair = ethKeyToKeyPair(privateKey)
  return new Nimiq.Wallet(keyPair)
}

async function init() {
  await initNimiq()

  if (_loading) return _loading

  _loading = new Promise(async function(resolve) {
    window.nim = $

    $.consensus = await Nimiq.Consensus.nano()

    $.blockchain = $.consensus.blockchain
    $.mempool = $.consensus.mempool
    $.network = $.consensus.network

    $.consensus.on('established', () => {
      Nimiq.Log.i('Consensus', `Current state: height=${$.blockchain.height}, headHash=${$.blockchain.headHash}`)

      resolve()
    })

    $.network.connect()
  })

  return _loading
}

async function getBalance(address) {
  await init()

  let account = await $.consensus.getAccount($.wallet.address)
  let balance = Nimiq.Policy.satoshisToCoins(account.balance).toFixed(0)

  return balance
}

async function withdraw(address, amount) {
  await init()

  let { addr, value, fee, height } = prepareTransaction(address, amount)

  let tx = $.wallet.createTransaction(addr, value, fee, height)

  sendTransaction(tx).then( () => getBalance() )

  return tx
}

function prepareTransaction(address, amount) {
  let height  = $.blockchain.height + 1
  let addr  = Nimiq.Address.fromUserFriendlyAddress(address)
  let value = Nimiq.Policy.coinsToSatoshis(amount)
  let fee   = Nimiq.Policy.coinsToSatoshis(0)

  return { addr, value, fee, height }
}

function ethKeyToKeyPair(ethKey) {
  let buf = new Buffer(ethKey.substring(2), 'hex')

  const privKey = new Nimiq.PrivateKey(buf)
  const publicKey = Nimiq.PublicKey.derive(privKey)
  return new Nimiq.KeyPair(privKey, publicKey)
}

function sendTransaction(tx) {
  $.consensus.relayTransaction(tx)
  return followTransaction(tx)
}

function followTransaction(tx) {
  $.consensus.subscribeAccounts([tx.recipient])
  Nimiq.Log.i('TX', `Waiting for Nimiq transaction [${tx.hash().toHex()}] to confirm, please wait...`)

  return new Promise(function(resolve) {
    const id = $.mempool.on('transaction-mined', tx2 => {
      if (tx.equals(tx2)) {
        Nimiq.Log.i('TX', `Nimiq transaction [${tx.hash().toHex()}] confirmed!`)

        $.mempool.off('transaction-mined', id)
        resolve()
      }
    })
  })
}

module.exports = window.nim_module = {
  login,
  getBalance,
  withdraw,
}
