import debug from 'debug'
import SwapApp, { SwapInterface, constants, util } from 'swap.app'
import BigNumber from 'bignumber.js'
import InputDataDecoder from 'ethereum-input-data-decoder'


class EthTokenSwap extends SwapInterface {

  _swapName: string
  address: string
  abi: any[]
  decimals: number
  tokenAddress: string
  tokenAbi: any[]
  gasLimit: number
  gasPrice: number
  fetchBalance: any
  estimateGasPrice: any
  _allSwapEvents: any

  app: any
  decoder: any
  contract: any
  ERC20: any

  /**
   *
   * @param {object}    options
   * @param {string}    options.name
   * @param {string}    options.address
   * @param {array}     options.abi
   * @param {string}    options.tokenAddress
   * @param {array}     options.tokenAbi
   * @param {number}    options.gasLimit
   * @param {function}  options.fetchBalance
   */
  constructor(options) {
    super()

    if (!options.name) {
      throw new Error('EthTokenSwap: "name" required')
    }
    if (!Object.values(constants.COINS).includes(options.name.toUpperCase())) {
      throw new Error('EthTokenSwap: "name" should be correct')
    }
    if (typeof options.address !== 'string') {
      throw new Error('EthTokenSwap: "address" required')
    }
    if (typeof options.decimals !== 'number') {
      throw new Error('EthTokenSwap: "decimals" required')
    }
    if (!Array.isArray(options.abi)) {
      throw new Error('EthTokenSwap: "abi" required')
    }
    if (typeof options.tokenAddress !== 'string') {
      throw new Error('EthTokenSwap: "tokenAddress" required')
    }
    if (!Array.isArray(options.tokenAbi)) {
      throw new Error('EthTokenSwap: "tokenAbi" required')
    }
    if (typeof options.estimateGasPrice !== 'function') {
      // ({ speed } = {}) => gasPrice
      console.warn(`EthTokenSwap: "estimateGasPrice" is not a function. You will not be able use automatic mempool-based fee`)
    }



    this._swapName      = options.name.toUpperCase()

    this.address        = options.address
    this.abi            = options.abi
    this.decimals       = options.decimals
    this.tokenAddress   = options.tokenAddress
    this.tokenAbi       = options.tokenAbi

    this.gasLimit       = options.gasLimit || 2e5
    this.gasPrice       = options.gasPrice || 2e9
    this.fetchBalance   = options.fetchBalance
    this.estimateGasPrice = options.estimateGasPrice || (() => {})

  }

  _initSwap(app) {
    super._initSwap(app)

    this.app = app

    const web3 = this.app.env.getWeb3()
    this.decoder        = new InputDataDecoder(this.abi)
    this.contract       = new web3.eth.Contract(this.abi, this.address)
    this.ERC20          = new web3.eth.Contract(this.tokenAbi, this.tokenAddress)
  }

  /**
   * @deprecated
   */
  updateGas() {
    console.warn(`EthSwap.updateGas() is deprecated and will be removed. Use .updateGasPrice()`)
    return this.updateGasPrice()
  }

  async updateGasPrice() {
    //@ts-ignore
    debug('gas price before update', this.gasPrice)

    try {
      this.gasPrice = await this.estimateGasPrice({ speed: 'fast' })
    } catch(err) {
      debug(`EthTokenSwap: Error with gas update: ${err.message}, using old value gasPrice=${this.gasPrice}`)
    }
    //@ts-ignore
    debug('gas price after update', this.gasPrice)
  }

  async send(methodName, args, _params = {}, handleTransactionHash) {
    if (typeof this.contract.methods[methodName] !== 'function') {
      throw new Error(`EthTokenSwap.send: No method ${methodName} in contract`)
    }

    await this.updateGasPrice()

    return new Promise(async (resolve, reject) => {
      const params = {
        from: this.app.getMyEthAddress(),
        gas: this.gasLimit,
        gasPrice: this.gasPrice,
        ..._params,
      }
      //@ts-ignore
      debug(`EthTokenSwap -> ${methodName} -> params`, params)

      let gasAmount = 0
      try {
        gasAmount = await this.contract.methods[methodName](...args).estimateGas(params)
      } catch (estimateGasError) {
        reject({ message: estimateGasError.message, gasAmount: new BigNumber(gasAmount).dividedBy(1e8).toString() })
        return
      }

      params.gas = gasAmount
      //@ts-ignore
      debug(`EthTokenSwap -> ${methodName} -> gas`, gasAmount)
      const receipt = await this.contract.methods[methodName](...args).send(params)
        .on('transactionHash', (hash) => {
          if (typeof handleTransactionHash === 'function') {
            handleTransactionHash(hash)
          }
        })
        .catch((error) => {
          reject({ message: error.message, gasAmount: new BigNumber(gasAmount).dividedBy(1e8).toString() })
        })

      resolve(receipt)
    })
  }

  /**
   *
   * @param {object} data
   * @param {BigNumber} data.amount
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async approve(data, handleTransactionHash) {
    const { amount } = data

    const exp = new BigNumber(10).pow(this.decimals)
    const newAmount = new BigNumber(amount).times(exp).toString()

    await this.updateGasPrice()

    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          from: this.app.getMyEthAddress(),
          gas: this.gasLimit,
          gasPrice: this.gasPrice,
        }
        //@ts-ignore
        debug(`EthTokenSwap -> approve -> params`, params)

        const gasAmount = await this.ERC20.methods.approve(this.address, newAmount).estimateGas(params)

        params.gas = gasAmount
        //@ts-ignore
        debug(`EthTokenSwap -> approve -> gas`, gasAmount)

        const result = await this.ERC20.methods.approve(this.address, newAmount).send(params)
          .on('transactionHash', (hash) => {
            if (typeof handleTransactionHash === 'function') {
              handleTransactionHash(hash)
            }
          })
          .catch((error) => {
            reject({ message: error.message, gasAmount: new BigNumber(gasAmount).dividedBy(1e8).toString() })
          })

        resolve(result)
      }
      catch (err) {
        reject(err)
      }
    })
  }

  /**
   *
   * @param {object} data
   * @param {string} data.spender
   * @returns {Promise}
   */
  checkAllowance(data) {
    const { spender } = data

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.ERC20.methods.allowance(spender, this.address).call({
          from: this.app.getMyEthAddress(),
        })

        resolve(result)
      }
      catch (err) {
        reject(err)
      }
    })
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @param {string} data.participantAddress
   * @param {BigNumber} data.amount
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async create(data, handleTransactionHash) {
    if (data.targetWallet && (data.targetWallet!==data.participantAddress)) {
      return this.createSwapTarget(data, handleTransactionHash)
    } else {
      return this.createSwap(data, handleTransactionHash)
    }
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @param {string} data.participantAddress
   * @param {BigNumber} data.amount
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async createSwap(data, handleTransactionHash) {
    const { secretHash, participantAddress, amount } = data

    const exp = new BigNumber(10).pow(this.decimals)
    const newAmount = new BigNumber(amount).times(exp).toString()

    const hash = `0x${secretHash.replace(/^0x/, '')}`
    const args = [ hash, participantAddress, newAmount, this.tokenAddress ]

    return this.send('createSwap', [...args], {}, handleTransactionHash)
  }

  /**
   *
   * @param {object} data
   * @param {string} data.secretHash
   * @param {string} data.participantAddress
   * @param {BigNumber} data.amount
   * @param {function} handleTransactionHash
   * @returns {Promise}
   */
  async createSwapTarget(data, handleTransactionHash) {
    const { secretHash, participantAddress, amount, targetWallet } = data

    const exp = new BigNumber(10).pow(this.decimals)
    const newAmount = new BigNumber(amount).times(exp).toString()

    const hash = `0x${secretHash.replace(/^0x/, '')}`
    const args = [ hash, participantAddress, targetWallet, newAmount, this.tokenAddress ]

    return this.send('createSwapTarget', [...args], {}, handleTransactionHash)
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
    //@ts-ignore
    debug('swapExists', swap)

    const balance = swap && swap.balance ? parseInt(swap.balance) : 0

    return balance > 0
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
    debug('swap.core:swaps')(`swap.secretHash`, secretHash)

    const _secretHash = `${secretHash.replace(/^0x/, '')}`

    debug('swap.core:swaps')(`secretHash: expected hash = ${expectedHash}, contract hash = ${_secretHash}`)

    if (expectedHash !== _secretHash) {
      return `Expected hash: ${expectedHash}, got: ${_secretHash}`
    }

    const expectedValueWei = new BigNumber(expectedValue).multipliedBy(this.decimals)
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
        console.error(`EthTokenSwap: fetchEvents: needs rescan`)
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
   * @param {object} data
   * @param {string} data.ownerAddress
   * @param {string} tokenAddress
   */
  async checkTokenIsValid(data) {
    const { ownerAddress, participantAddress } = data

    debug('swap.core:swaps')(`Check token is valid. Needed token address: ${this.tokenAddress.toUpperCase()}`);
    const swap = await util.helpers.repeatAsyncUntilResult(() =>
      this.contract.methods.swaps(ownerAddress, participantAddress).call()
    )
    //@ts-ignore
    const { token } = swap
    debug('swap.core:swaps')(`Token address at swap contract: ${token.toUpperCase()}`);

    return (this.tokenAddress.toUpperCase() == token.toUpperCase())
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
    let address = await util.helpers.repeatAsyncUntilResult(() =>
      this.getTargetWalletPromise(ownerAddress)
    )
    return address
  }

  /**
   *
   * @param {string} ownerAddress
   * @returns {string}
   */
  async getTargetWalletPromise(ownerAddress) {
    debug('swap.core:swaps')('EthTokenSwap->getTargetWallet');
    return new Promise(async (resolve, reject) => {
      try {
        const targetWallet = await this.contract.methods.getTargetWallet(ownerAddress).call({
          from: this.app.getMyEthAddress(),
        })
        debug('swap.core:swaps')('EthTokenSwap->getTargetWallet',targetWallet);

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
    } , handleTransactionHash)
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
        const gasAmount = await this.contract.methods.withdrawOther(_secret, ownerAddress, participantAddress).estimateGas(params);
        resolve(gasAmount)
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

    return new Promise(async (resolve, reject) => {
      try {
        const secret = await this.contract.methods.getSecret(participantAddress).call({
          from: this.app.getMyEthAddress(),
        })

        const secretValue = secret && !/^0x0+$/.test(secret) ? secret : null

        resolve(secretValue)
      }
      catch (err) {
        reject(err)
      }
    })
  }


  /**
   *
   * @param {string} transactionHash
   * @returns {Promise<any>}
   */
  getSecretFromTxhash = (transactionHash) =>
    this.app.env.web3.eth.getTransaction(transactionHash)
      .then(txResult => {
        try {
          const bytes32 = this.decoder.decodeData(txResult.input)
          return this.app.env.web3.utils.bytesToHex(bytes32.inputs[0]).split('0x')[1]
        } catch (err) {
          debug('swap.core:swaps')('Trying to fetch secret from tx: ' + err.message)
          return
        }
      })
}


export default EthTokenSwap
