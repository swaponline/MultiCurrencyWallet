import debugCreate from 'debug'

import * as bitcoin from './../instances/ethereum' // todo: obviously this is wrong
import * as ethereum from './../instances/ethereum'


const debug = debugCreate('swap.core:simple:wallet')

const BLOCKCHAININFO = isMain => isMain ? `https://blockchain.info` : `https://testnet.blockchain.info`
const ETHERSCANIO = isMain => isMain ? `https://etherscan.io` : `https://rinkeby.etherscan.io`

class Wallet {
  id: any
  network: any
  ethereum: any
  bitcoin: any
  swapApp: any
  constants: any
  auth: any
  balances: any

  constructor(app, constants, config) {
    this.id = config.id
    this.network = app.network
    this.ethereum = ethereum
    this.bitcoin = bitcoin
    this.swapApp = app
    this.constants = constants
    this.auth = app.services.auth
    this.balances = {}
  }

  async withdraw(from, to, value) {
    switch (from) {
      case 'btc':
        const account = this.auth.accounts.btc
        return await this.bitcoin.sendTransaction({ account, to, value })
      case 'eth':
        return await this.ethereum.sendTransaction({ to, value })
      default:
        return Promise.reject('not implemented')
    }
  }

  async getBalanceBySymbol(symbol) {

    if (!this.balances[symbol]) {
      debug('updating balance', Date())
      let balances = await this.getBalance()
      balances.map(x => this.balances[x.symbol] = x)
    }

    return this.balances[symbol]
  }

  async getData(options?) {
    const { coins } = options

    const currencies = coins || Object.values(this.constants.COINS)
    const data = this.auth.getPublicData()
    const addresses = currencies.reduce((obj, symbol) => {
      let account = data.eth
      if (data[symbol.toLowerCase()]) account = data[symbol.toLowerCase()]

      const { address } = account

      return {
        ...obj,
        [symbol]: address,
      }
    }, {})

    const fetchBalances = currencies.map(symbol => {
      try {
        const instance = this.swapApp.swaps[symbol]
        const address = addresses[symbol]

        return instance ? instance.fetchBalance(address) : '-'
      } catch (err) {
        debug(`Error fetching ${symbol} balance: ${err.message}`)
        return '-'
      }
    })

    const values = await Promise.all(fetchBalances)

    return values.map((value, index) => ({
      symbol: currencies[index],
      amount: value,
      address: addresses[currencies[index]]
    }))
  }

  fetchBalance(symbol) {
    const data = this.auth.getPublicData()
    let account = data.eth
    if (data[symbol.toLowerCase()]) account = data[symbol.toLowerCase()]
    const instance = this.swapApp.swaps[symbol]

    return instance ? instance.fetchBalance(account.address) : '-'
  }

  async getBalance(symbols?) {
    const currencies = symbols || Object.values(this.constants.COINS)

    const values = await Promise.all(
      currencies.map(symbol => this.fetchBalance(symbol)))

    return values.map((value, index) => ({
      symbol: currencies[index],
      value,
    }))
  }

  getCore() {
    return {
      eth: this.ethereum.core,
      btc: this.bitcoin.core,
    }
  }

  view() {
    return {
      id: this.id,
      network: this.network,
      mainnet: this.swapApp.isMainNet(),
      'etherscan.io': `${ETHERSCANIO(this.swapApp.isMainNet())}/address/${this.auth.accounts.eth.address}`,
      'blockchain.info': `${BLOCKCHAININFO(this.swapApp.isMainNet())}/address/${this.auth.accounts.btc.getAddress()}`,
      room: this.swapApp.services.room.roomName,
      ...this.auth.getPublicData(),
    }
  }

  async detailedView() {
    const gasPrice = await this.ethereum.core.eth.getGasPrice()
    const gasLimit = 3e6 // TODO sync with EthSwap.js
    const btcFee = 15000 // TODO sync with BtcSwap.js and bitcoin instance

    return {
      eth: {
        gasPrice,
        gasLimit,
        // ...ethereum.core,
      },
      btc: {
        fee: btcFee,
        // ...bitcoin.core,
      },
      wallet: this.view()
    }
  }

}

export default Wallet
