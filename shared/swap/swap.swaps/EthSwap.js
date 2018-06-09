import SwapApp, { SwapInterface } from '../swap.app'


class EthSwap extends SwapInterface {

  /**
   *
   * @param {object}    options
   * @param {string}    options.address
   * @param {array}     options.abi
   * @param {number}    options.gasLimit
   * @param {function}  options.fetchBalance
   */
  constructor(options) {
    super()

    if (typeof options.fetchBalance !== 'function') {
      throw new Error('EthSwap: "fetchBalance" required')
    }
    if (typeof options.address !== 'string') {
      throw new Error('EthSwap: "address" required')
    }
    if (!Array.isArray(options.abi)) {
      throw new Error('EthSwap: "abi" required')
    }

    this.address        = options.address
    this.abi            = options.abi

    this._swapName      = 'ethSwap'
    this.gasLimit       = options.gasLimit || 3e6
    this.fetchBalance   = options.fetchBalance
  }

  _initSwap() {
    this.contract = new SwapApp.env.web3.eth.Contract(this.abi, this.address)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.participantAddress
   * @param {function} handleTransactionHash
   */
  sign(data, handleTransactionHash) {
    const { participantAddress } = data

    return new Promise(async (resolve, reject) => {
      const params = {
        from: SwapApp.services.auth.accounts.eth.address,
        gas: this.gasLimit,
      }

      const receipt = await this.contract.methods.sign(participantAddress).send(params)
        .on('transactionHash', (hash) => {
          if (typeof handleTransactionHash === 'function') {
            handleTransactionHash(hash)
          }
        })
        .on('error', (err) => {
          reject(err)
        })

      resolve(receipt)
    })
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @param {string} data.participantAddress
   * @param {number} data.amount
   * @param {function} handleTransactionHash
   */
  create(data, handleTransactionHash) {
    const { secretHash, participantAddress, amount } = data

    return new Promise(async (resolve, reject) => {
      const hash = `0x${secretHash.replace(/^0x/, '')}`

      const params = {
        from: SwapApp.services.auth.accounts.eth.address,
        gas: this.gasLimit,
        value: Math.floor(SwapApp.env.web3.utils.toWei(String(amount))),
      }

      const values = [ hash, participantAddress ]

      const receipt = await this.contract.methods.createSwap(...values).send(params)
        .on('transactionHash', (hash) => {
          if (typeof handleTransactionHash === 'function') {
            handleTransactionHash(hash)
          }
        })
        .on('error', (err) => {
          reject(err)
        })

      resolve(receipt)
    })
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secret
   * @param {string} data.ownerAddress
   * @param {function} handleTransactionHash
   */
  withdraw(data, handleTransactionHash) {
    const { ownerAddress, secret } = data

    return new Promise(async (resolve, reject) => {
      const _secret = `0x${secret.replace(/^0x/, '')}`

      const params = {
        from: SwapApp.services.auth.accounts.eth.address,
        gas: this.gasLimit,
      }

      const receipt = await this.contract.methods.withdraw(_secret, ownerAddress).send(params)
        .on('transactionHash', (hash) => {
          if (typeof handleTransactionHash === 'function') {
            handleTransactionHash(hash)
          }
        })
        .on('error', (err) => {
          reject(err)
        })

      resolve(receipt)
    })
  }

  refund() {
    // TODO write refund functional
  }

  getSecret({ participantAddress }) {
    return new Promise(async (resolve, reject) => {
      let secret

      try {
        secret = await this.contract.methods.getSecret(participantAddress).call({
          from: SwapApp.services.auth.accounts.eth.address,
        })
      }
      catch (err) {
        reject(err)
      }

      resolve(secret)
    })
  }

  close({ participantAddress }, handleTransactionHash) {
    return new Promise(async (resolve, reject) => {
      const params = {
        from: SwapApp.services.auth.accounts.eth.address,
        gas: this.gasLimit,
      }

      const receipt = await this.contract.methods.close(participantAddress).send(params)
        .on('transactionHash', (hash) => {
          if (typeof handleTransactionHash === 'function') {
            handleTransactionHash(hash)
          }
        })
        .on('error', (err) => {
          reject(err)
        })

      resolve(receipt)
    })
  }
}


export default EthSwap
