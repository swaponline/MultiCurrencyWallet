import _debug from 'debug'
import SwapApp, { constants, SwapInterface, util } from 'swap.app'
import BigNumber from 'bignumber.js'
import InputDataDecoder from 'ethereum-input-data-decoder'
const debug = _debug('swap.core:swaps')

class EthSwap extends SwapInterface {

  address: string
  abi: any[]
  _swapName: any
  gasLimit: number
  gasPrice: number
  fetchBalance: any
  estimateGasPrice: any

  app: any
  decoder: any
  contract: any
  _allSwapEvents: any

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
    if (typeof options.estimateGasPrice !== 'function') {
      // ({ speed } = {}) => gasPrice
      console.warn(`EthTokenSwap: "estimateGasPrice" is not a function. You will not be able use automatic mempool-based fee`)
    }

    this.address        = options.address
    this.abi            = options.abi

    this._swapName      = constants.COINS.eth
    this.gasLimit       = options.gasLimit || 3e5
    this.gasPrice       = options.gasPrice || 2e9
    this.fetchBalance   = options.fetchBalance
    this.estimateGasPrice = options.estimateGasPrice || (() => {})
  }

  _initSwap(app) {
    super._initSwap(app)

    this.app = app

    this.decoder  = new InputDataDecoder(this.abi)

    const web3 = this.app.env.getWeb3()

    this.contract = new web3.eth.Contract(this.abi, this.address)
  }

  /**
   * @deprecated
   */
  updateGas() {
    console.warn(`EthSwap.updateGas() is deprecated and will be removed. Use .updateGasPrice()`)
    //@ts-ignore
    return updateGasPrice()
  }

  async updateGasPrice() {
    debug('gas price before update', this.gasPrice)

    try {
      this.gasPrice = await this.estimateGasPrice({ speed: 'fast' })
    } catch(err) {
      debug(`EthSwap: Error with gas update: ${err.message}, using old value gasPrice=${this.gasPrice}`)
    }

    debug('gas price after update', this.gasPrice)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @param {string} data.participantAddress
   * @param {string} data.targetWallet
   * @param {number} data.amount
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async create(data, handleTransactionHash) {
    if (data.targetWallet && (data.targetWallet!==data.participantAddress) && this.hasTargetWallet()) {
      return this.createSwapTarget(data, handleTransactionHash)
    } else {
      return this.createSwap(data, handleTransactionHash)
    }
  }

  async send(methodName, args, _params = {}, handleTransactionHash) {
    if (typeof this.contract.methods[methodName] !== 'function') {
      throw new Error(`EthSwap.send: No method ${methodName} in contract`)
    }

    await this.updateGasPrice()

    return new Promise(async (resolve, reject) => {
      const params = {
        from: this.app.getMyEthAddress(),
        gas: this.gasLimit,
        gasPrice: this.gasPrice,
        ..._params,
      }

      debug(`EthSwap -> ${methodName} -> params`, params)

      const gasAmount = await this.contract.methods[methodName](...args).estimateGas(params)

      params.gas = gasAmount

      debug(`EthSwap -> ${methodName} -> gas`, gasAmount)

      const receipt = await this.contract.methods[methodName](...args).send(params)
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
   * @param {string} data.targetWallet
   * @param {number} data.amount
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async createSwap(data, handleTransactionHash) {
    const { secretHash, participantAddress, amount } = data
    const web3 = this.app.env.getWeb3()

    const amountWei = web3.utils.toWei(amount.toString())

    const hash = `0x${secretHash.replace(/^0x/, '')}`
    const args = [ hash, participantAddress ]

    return this.send('createSwap', [...args], { value: amountWei }, handleTransactionHash)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @param {string} data.participantAddress
   * @param {string} data.targetWallet
   * @param {number} data.amount
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async createSwapTarget(data, handleTransactionHash) {
    const { secretHash, participantAddress, amount, targetWallet } = data

    const web3 = this.app.env.getWeb3()

    await this.updateGasPrice()

    const amountWei = web3.utils.toWei(amount.toString())

    const hash = `0x${secretHash.replace(/^0x/, '')}`

    const values = [ hash, participantAddress, targetWallet ]

    return this.send('createSwapTarget', [...values], { value: amountWei }, handleTransactionHash)
  }
  
  /**
   *
   * @param {object} data
   * @param {string} data.ownerAddress
   * @returns {Promise}
   */
  getBalance(data) {
    const { ownerAddress } = data

    return this.contract.methods.getBalance(ownerAddress).call({
      from: this.app.getMyEthAddress(),
    })
  }

  /**
   *
   * @param {object} data
   * @param {string} data.ownerAddress
   * @param {string} data.participantAddress
   * @returns {Promise}
   */
  swaps(data) {
    const { ownerAddress, participantAddress } = data

    return this.contract.methods.swaps(ownerAddress, participantAddress).call()
  }

  /**
   *
   * @param {object} data
   * @param {string} data.ownerAddress
   * @param {string} data.participantAddress
   * @returns {Promise}
   */
  async checkSwapExists(data) {
    const swap = await this.swaps(data)

    debug('swapExists', swap)

    const balance = swap && swap.balance ? parseInt(swap.balance) : 0

    return balance > 0
  }

  /**
   *
   * @param {object} data
   * @param {string} data.ownerAddress
   * @param {BigNumber} data.expectedValue
   * @returns {Promise.<string>}
   */
  async checkBalance(data) {
    const { ownerAddress, participantAddress, expectedValue, expectedHash } = data

    const balance = await util.helpers.repeatAsyncUntilResult(() =>
      this.getBalance({ ownerAddress })
    )
    const swap = await util.helpers.repeatAsyncUntilResult(() =>
      this.contract.methods.swaps(ownerAddress, participantAddress).call()
    )
    //@ts-ignore
    const { secretHash } = swap
    debug(`swap.secretHash`, secretHash)

    const _secretHash = `${secretHash.replace(/^0x/, '')}`

    debug(`secretHash: expected hash = ${expectedHash}, contract hash = ${_secretHash}`)

    if (expectedHash !== _secretHash) {
      return `Expected hash: ${expectedHash}, got: ${_secretHash}`
    }

    const expectedValueWei = new BigNumber(expectedValue).multipliedBy(1e18)
    //@ts-ignore
    if (expectedValueWei.isGreaterThan(balance)) {
      return `Expected value: ${expectedValueWei.toString()}, got: ${balance}`
    }
  }

  /**
   *
   * @returns {Promise}
   */
  async fetchSwapEvents() {
    if (this._allSwapEvents) return this._allSwapEvents

    const allSwapEvents = await this.contract.getPastEvents('allEvents', {
      fromBlock: 0,
      toBlock: 'latest',
    })

    this.contract.events.allEvents({ fromBlock: 0, toBlock: 'latest' })
      .on('data', event => {
        this._allSwapEvents.push(event)
      })
      .on('changed', (event) => {
        console.error(`EthSwap: fetchEvents: needs rescan`)
        this._allSwapEvents = null
      })
      .on('error', err => {
        console.error(err)
        this._allSwapEvents = null
      })

    this._allSwapEvents = allSwapEvents

    return allSwapEvents
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @returns {Promise}
   */
  async findSwap(data) {
    const { secretHash } = data

    const allSwapEvents = await this.fetchSwapEvents()

    const swapEvents = allSwapEvents
      .filter(({ returnValues }) => returnValues._secretHash === `0x${secretHash.replace('0x','')}`)

    const [ create, close, ...rest ] = swapEvents

    if (rest && rest.length) {
      console.error(`More than two swaps with same hash`, rest)
      // throw new Error(`More than two swaps with same hash`)
    }

    return [ create, close ]
  }

  /**
    *
    * @param {object} data
    * @param {string} data.secretHash
    * @returns {Promise(status)}
    */

  async wasClosed(data) {
    const [ create, close ] = await this.findSwap(data)

    if (!create) {
      debug(`No swap with hash ${data.secretHash}`)
      return 'no swap'
    } else if (create && !close) {
      debug(`Open yet!`)
      return 'open'
    } else {
      if (close.event == 'Withdraw') {
        debug(`Withdrawn`)
        return 'withdrawn'
      } else if (close.event == 'Refund') {
        debug(`Refund`)
        return 'refunded'
      } else {
        debug(`Unknown event, error`)
        return 'error'
      }
    }
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @returns {Promise(boolean)}
   */
  wasRefunded(data) {
    return this.wasClosed(data)
      .then((status) =>
        status === 'refunded'
      )
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @returns {Promise(boolean)}
   */
  async wasWithdrawn(data) {
    const status = await this.wasClosed(data)
    return status === 'withdrawn'
  }

  /**
   *
   * @returns {boolean}
   */
  hasTargetWallet() {
    return !!this.contract.methods.getTargetWallet
  }

  /**
   *
   * @param {string} ownerAddress
   * @returns {Promise.<string>}
   */
  async getTargetWallet(ownerAddress) {
    console.log('EthSwap->getTargetWallet');
    let address = await util.helpers.repeatAsyncUntilResult(() =>
      this.getTargetWalletPromise(ownerAddress)
    )
    return address
  }

  /**
   *
   * @param {string} ownerAddress
   * @param {number} repeatCount
   * @returns {string}
   */
  async getTargetWalletPromise(ownerAddress) {
    return new Promise(async (resolve, reject) => {
      try {
        const targetWallet = await this.contract.methods.getTargetWallet(ownerAddress).call({
          from: this.app.getMyEthAddress(),
        })

        resolve(targetWallet)
      }
      catch (err) {
        reject(err)
      }
    });
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secret
   * @param {string} data.ownerAddress
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async calcWithdrawGas(data) {
    return this.calcWithdrawOtherGas({
      ownerAddress: data.ownerAddress,
      participantAddress: this.app.getMyEthAddress(),
      secret: data.secret,
    })
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secret
   * @param {string} data.ownerAddress
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async withdraw(data, handleTransactionHash) {
    return this.withdrawOther({
      ownerAddress: data.ownerAddress,
      participantAddress: this.app.getMyEthAddress(),
      secret: data.secret,
    }, handleTransactionHash)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secret
   * @param {string} data.participantAddress
   * @returns {Promise}
   */
  async calcWithdrawNoMoneyGas(data) {
    return this.calcWithdrawOtherGas({
      ownerAddress: this.app.getMyEthAddress(),
      participantAddress: data.participantAddress,
      secret: data.secret,
    })
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secret
   * @param {string} data.participantAddress
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async withdrawNoMoney(data, handleTransactionHash) {
    return this.withdrawOther({
      ownerAddress: this.app.getMyEthAddress(),
      participantAddress: data.participantAddress,
      secret: data.secret,
    }, handleTransactionHash)
  }

  async calcWithdrawOtherGas(data) {
    const { ownerAddress, participantAddress, secret } = data

    await this.updateGasPrice()

    return new Promise(async (resolve, reject) => {
      const _secret = `0x${secret.replace(/^0x/, '')}`

      const params = {
        from: this.app.getMyEthAddress(),
        gas: this.gasLimit,
        gasPrice: this.gasPrice,
      }

      try {
        const gasFee = await this.contract.methods.withdrawOther(_secret, ownerAddress, participantAddress).estimateGas(params);
        resolve(gasFee)
      }
      catch (err) {
        reject(err)
      }
    })
  }
  /**
   *
   * @param {object} data
   * @param {string} data.secret
   * @param {string} data.ownerAddress
   * @param {string} data.participantAddress
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async withdrawOther(data, handleTransactionHash) {
    const { ownerAddress, participantAddress, secret } = data

    const _secret = `0x${secret.replace(/^0x/, '')}`

    await this.updateGasPrice()

    return this.send('withdrawOther', [ _secret, ownerAddress, participantAddress ], {}, handleTransactionHash)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.participantAddress
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async refund(data, handleTransactionHash) {
    const { participantAddress } = data

    await this.updateGasPrice()

    return this.send('refund', [ participantAddress ], {}, handleTransactionHash)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.participantAddress
   * @returns {Promise}
   */
  getSecret(data) {
    const { participantAddress } = data

    return this.contract.methods.getSecret(participantAddress).call({
      from: this.app.getMyEthAddress(),
    })
      .then((secret) => {
        debug('secret ethswap.js', secret)
        return secret && !/^0x0+$/.test(secret) ? secret : null
      })
      .catch((error) => error)
  }

/*
  Function: withdraw(bytes32 _secret, address _ownerAddress)
  bytes32 {...}
  inputs: (2) […]
    0: Uint8Array(32) [ 208, 202, 170, … ]
    1: "e918c8719bae0525786548b8da7fbef9b33d4e25"
  name: "withdraw"
  types: (2) […]
    0: "bytes32"
    1: "address"
*/

  /**
   *
   * @param {string} transactionHash
   * @returns {Promise<any>}
   */
  getSecretFromTxhash = (transactionHash) =>
    this.app.env.getWeb3().eth.getTransaction(transactionHash)
      .then(txResult => {
        try {
          const bytes32 = this.decoder.decodeData(txResult.input)
          return this.app.env.getWeb3().utils.bytesToHex(bytes32.inputs[0]).split('0x')[1]
        } catch (err) {
          debug('Trying to fetch secret from tx: ' + err.message)
          return
        }
      })
}


export default EthSwap
