import KrakenClient from 'kraken-api'


//const { wallet } = require('../services')
const wallet = ''

class KrakenApi {

  key: string
  core: KrakenClient
  pair: string
  isMainnet: boolean

  constructor() {
    const secret = process.env.KRAKEN_API_SECRET
    //@ts-ignore: strictNullChecks
    this.key = process.env.KRAKEN_API_KEY
    this.core = new KrakenClient(this.key, secret, { dev: true })
    this.pair = 'XETHXXBT'
    this.isMainnet = process.env.NETWORK === 'mainnet'
  }

  getBalance() {
    return this.core.api('Balance')
  }

  getPairs() {
    return this.core.api('AssetPairs')
  }

  deposit() {
    //@ts-ignore
    wallet.withdraw(amount,)
  }

  run(amount, type) {
    //@ts-ignore
    this.deposit(type, '', amount)
  }

  /*
  * @ToDo check */
  createOrder(amount, type) {
    if (!this.key) {
      return
    }

    return this.core.api('AddOrder', {
      'pair': 'ETHXBT', //XBTUSD & ETHUSD
      'type': type, //sell & buy
      'volume': amount,
      'ordertype': 'market',
      //  'validate': !this.isMainnet,
      //  'pair' : '',
    })//
    // .then(this.returnMoney(amount))
      .then(console.log)
      .catch(console.log)
  }

  returnMoney(amount) {
    let result = this.core.api('Withdraw', {
      //@ts-ignore
      'key': type, //sell & buy
      'amount': amount,
      'asset': 'ETH' //@ToDo переделать XBT
      //  'pair' : '',
    }).then(this.returnMoney(amount))
      .catch(console.log)
  }

  /*
  * get all orders
  * */
  async getTrades() {
    let that = this

    return new Promise(async function (resolve, reject) {
      that.core.api('Trades', { pair: that.pair }).then((r) => {
        resolve(r.result[that.pair])
      }).catch(reject)
    });
  }

}

export default new KrakenApi()
