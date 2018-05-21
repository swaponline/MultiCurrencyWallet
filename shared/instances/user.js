import bitcoin from './bitcoin'
import ethereum from './ethereum'
import config, { request } from 'helpers'


class User {
  constructor() {
    this.ethData = {
      address: '0x0',
      publicKey: '0x0',
      balance: 0,
    }
    this.btcData = {
      address: '0x0',
      publicKey: '0x0',
      balance: 0,
    }
  }

  async getData() {
    await this.sign()
    await this.getBalances()
    return [
      {
        currency: 'btc',
        address: this.btcData.address,
        publicKey: this.btcData.publicKey,
        balance: this.btcData.balance,
      },
      {
        currency: 'eth',
        address: this.ethData.address,
        publicKey: this.ethData.publicKey,
        balance: this.ethData.balance,
      },
    ]
  }
}

export default new User()

export {
  User,
}
