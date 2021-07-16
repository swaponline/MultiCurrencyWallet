import _debug from 'debug'
import { SwapInterface, util } from 'swap.app'
import BigNumber from 'bignumber.js'
import InputDataDecoder from 'ethereum-input-data-decoder'
const debug = _debug('swap.core:swaps')

class EthLikeSwap extends SwapInterface {

  options: any
  address: string
  abi: any[]
  _swapName: string
  gasLimit: number
  gasLimitReserve: number
  gasPrice: number
  fetchBalance: Function
  estimateGasPrice: Function
  sendTransaction: Function

  web3adapter: any // web3.eth
  web3utils: any // web3.utils
  getMyAddress: any
  getParticipantAddress: any
  coinName: string

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

    if (options.coinName === undefined) {
      throw new Error('EthLikeSwap swap - option `coinName` not defined')
    }
    if (typeof options.fetchBalance !== 'function') {
      throw new Error('EthLikeSwap: "fetchBalance" required')
    }
    if (typeof options.address !== 'string') {
      throw new Error('EthLikeSwap: "address" required')
    }
    if (!Array.isArray(options.abi)) {
      throw new Error('EthLikeSwap: "abi" required')
    }
    if (options.getWeb3Adapter === undefined) {
      throw new Error(`EthLikeSwap ${options.coinName}: option 'getWeb3Adapter' not defined`)
    }
    if (options.getWeb3Utils === undefined) {
      throw new Error(`EthLikeSwap ${options.coinName}: option 'getWeb3Utils' not defined`)
    }
    if (options.getMyAddress === undefined) {
      throw new Error(`EthLikeSwap ${options.coinName}: option 'getMyAddress' not defined`)
    }
    if (options.getParticipantAddress === undefined) {
      throw new Error(`EthLikeSwap ${options.coinName}: option 'getParticipantAddress' not defined`)
    }
    if (typeof options.estimateGasPrice !== 'function') {
      // ({ speed } = {}) => gasPrice
      console.warn(`EthLikeSwap: "estimateGasPrice" is not a function. You will not be able use automatic mempool-based fee`)
    }

    this.options        = options
    this.address        = options.address
    this.abi            = options.abi

    this.coinName       = options.coinName

    this._swapName      = options.coinName //constants.COINS.eth

    this.gasLimit       = options.gasLimit || 5e5
    this.gasLimitReserve = options.gasLimitReserve || 1.10 // default +10% of the total estimateGas
    this.gasPrice       = options.gasPrice || 2e9
    this.fetchBalance   = options.fetchBalance
    this.estimateGasPrice = options.estimateGasPrice || (() => {})
    this.sendTransaction = options.sendTransaction
  }

  _initSwap(app) {
    super._initSwap(app)

    this.app = app
    if (typeof this.app[this.options.getWeb3Adapter] !== 'function') {
      throw new Error(`EthLikeSwap ${this.coinName}: SwapApp function '${this.options.getWeb3Adapter}' not defined`)
    }
    if (typeof this.app[this.options.getWeb3Utils] !== 'function') {
      throw new Error(`EthLikeSwap ${this.coinName}: SwapApp function '${this.options.getWeb3Utils}' not defined`)
    }
    if (typeof this.app[this.options.getMyAddress] !== 'function') {
      throw new Error(`EthLikeSwap ${this.coinName}: SwapApp function '${this.options.getMyAddress}' not defined`)
    }
    if (typeof this.app[this.options.getParticipantAddress] !== 'function') {
      throw new Error(`EthLikeSwap ${this.coinName}: SwapApp function '${this.options.getParticipantAddress}' not defined`)
    }

    this.web3adapter = this.app[this.options.getWeb3Adapter].bind(this.app)()
    this.web3utils = this.app[this.options.getWeb3Utils].bind(this.app)()
    this.getMyAddress = this.app[this.options.getMyAddress].bind(this.app)
    this.getParticipantAddress = this.app[this.options.getParticipantAddress].bind(this.app)

    this.decoder  = new InputDataDecoder(this.abi)

    this.contract = new this.web3adapter.Contract(this.abi, this.address)
  }

  async updateGasPrice() {
    debug('gas price before update', this.gasPrice)

    try {
      this.gasPrice = await this.estimateGasPrice({ speed: 'fast' })
    } catch(err) {
      debug(`EthLikeSwap ${this.coinName}: Error with gas update: ${err.message}, using old value gasPrice=${this.gasPrice}`)
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
    if (
      data.targetWallet
      && (
        (data.targetWallet!==data.participantAddress)
        ||
        data.useTargetWallet
      )
      && this.hasTargetWallet()
    ) {
      return this.createSwapTarget(data, handleTransactionHash)
    } else {
      return this.createSwap(data, handleTransactionHash)
    }
  }

  async send(methodName, args, _params = {}, handleTransactionHash) {
    if (typeof this.contract.methods[methodName] !== 'function') {
      throw new Error(`EthLikeSwap.send ${this.coinName}: No method ${methodName} in contract`)
    }

    await this.updateGasPrice()

    return new Promise(async (resolve, reject) => {
      const params = {
        from: this.getMyAddress(),
        gasPrice: this.gasPrice,
        ..._params,
      }

      debug(`EthLikeSwap ${this.coinName} -> ${methodName} -> params`, params)

      const gasAmount = await this.contract.methods[methodName](...args).estimateGas(params)
      params['gas'] = new BigNumber(gasAmount).multipliedBy(this.gasLimitReserve).dp(0, BigNumber.ROUND_UP).toNumber() || this.gasLimit

      debug(`EthLikeSwapSwap ${this.coinName} -> ${methodName} -> gas`, gasAmount)

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

    const amountWei = this.web3utils.toWei(amount.toString())

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

    await this.updateGasPrice()

    const amountWei = this.web3utils.toWei(amount.toString())

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
      from: this.getMyAddress(),
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
  async getTargetWallet(ownerAddress: string): Promise<string> {
    let address: any = await util.helpers.repeatAsyncUntilResult(() =>
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
  async getTargetWalletPromise(ownerAddress: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const targetWallet = await this.contract.methods.getTargetWallet(ownerAddress).call({
          from: this.getMyAddress(),
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
      participantAddress: this.getMyAddress(),
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
      participantAddress: this.getMyAddress(),
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
      ownerAddress: this.getMyAddress(),
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
      ownerAddress: this.getMyAddress(),
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
        from: this.getMyAddress(),
        gasPrice: this.gasPrice,
      }

      try {
        const gasFee = await this.contract.methods.withdrawOther(_secret, ownerAddress, participantAddress).estimateGas(params)
        resolve(new BigNumber(gasFee).multipliedBy(this.gasLimitReserve).dp(0, BigNumber.ROUND_UP).toNumber())
      }
      catch (err) {
        console.error("calcWithdrawOtherGasError", err)
        resolve(this.gasLimit)
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
  //@ts-ignore: strictNullChecks
  async refund(data, handleTransactionHash: Function = null) {
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
      from: this.getMyAddress(),
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
    this.web3adapter.getTransaction(transactionHash)
      .then(txResult => {
        try {
          const bytes32 = this.decoder.decodeData(txResult.input)
          return this.web3utils.bytesToHex(bytes32.inputs[0]).split('0x')[1]
        } catch (err) {
          debug('Trying to fetch secret from tx: ' + err.message)
          return
        }
      })

  async fundContract({
    flow,
    useTargetWallet,
  }: {
    flow: any,
    useTargetWallet?: boolean,
  }) {
    const abClass = this
    const {
      participant,
      buyAmount,
      sellAmount,
      waitConfirm,
    } = flow.swap

    const { secretHash } = flow.state

    const swapData = {
      participantAddress: abClass.getParticipantAddress(flow.swap),
      secretHash: secretHash,
      amount: sellAmount,
      targetWallet: (flow.swap.destinationSellAddress)
        ? flow.swap.destinationSellAddress
        : abClass.getParticipantAddress(flow.swap),
      useTargetWallet,
    }

    const tryCreateSwap = async () => {
      const {
        isEthContractFunded, // @to-do - rename all `eth` to `ab` or other
        ethSwapCreationTransactionHash,
      } = flow.state

      if (!isEthContractFunded) {
        try {
          _debug('swap.core:flow')('check swap exists')
          const swapExists = await flow._checkSwapAlreadyExists()
          if (swapExists) {
            console.warn('Swap exists!! May be stucked. Try refund')
            await flow.ethLikeSwap.refund({
              participantAddress: abClass.getParticipantAddress(flow.swap),
            }, (refundTx) => {
              _debug('swap.core:flow')('Stucked swap refunded', refundTx)
            })
          }
          _debug('swap.core:flow')('create swap', swapData)
          await abClass.create(swapData, (hash) => {
            _debug('swap.core:flow')('create swap tx hash', hash)
            flow.swap.room.sendMessage({
              event: 'create eth contract',
              data: {
                ethSwapCreationTransactionHash: hash,
              },
            })

            flow.setState({
              ethSwapCreationTransactionHash: hash,
              canCreateEthTransaction: true,
              isFailedTransaction: false,
            }, true)
          })
        } catch (err) {
          if (flow.state.ethSwapCreationTransactionHash) {
            console.error('fail create swap, but tx already exists')
            flow.setState({
              canCreateEthTransaction: true,
              isFailedTransaction: false,
            }, true)
            return true
          }
          if ( /known transaction/.test(err.message) ) {
            console.error(`known tx: ${err.message}`)
          } else if ( /out of gas/.test(err.message) ) {
            console.error(`tx failed (wrong secret?): ${err.message}`)
          } else {
            console.error(err)
          }

          flow.setState({
            canCreateEthTransaction: false,
            isFailedTransaction: true,
            isFailedTransactionError: err.message,
          }, true)

          return null
        }
      } else {
        flow.swap.room.sendMessage({
          event: 'create eth contract',
          data: {
            ethSwapCreationTransactionHash,
            secretHash,
          },
        })
      }
      return true
    }

    const isEthContractFunded = await util.helpers.repeatAsyncUntilResult(() =>
      tryCreateSwap(),
    )

    const { isStoppedSwap } = flow.state

    if (isEthContractFunded && !isStoppedSwap) {
      _debug('swap.core:flow')(`finish step`)
      flow.finishStep({
        isEthContractFunded,
      }, {step: 'lock-eth'})
    }
  }


  async getSecretFromContract({
    flow,
  }: {
    flow: any,
  }) {
    const abClass = this

    flow.swap.room.once('ethWithdrawTxHash', async ({ethSwapWithdrawTransactionHash}) => {
      flow.setState({
        ethSwapWithdrawTransactionHash,
      }, true)

      const secretFromTxhash = await util.helpers.extractSecretFromTx({
        flow,
        swapFlow: abClass,
        app: abClass.app,
        ethSwapWithdrawTransactionHash,
      })

      const { isEthWithdrawn } = flow.state

      if (!isEthWithdrawn && secretFromTxhash) {
        _debug('swap.core:flow')('got secret from tx', ethSwapWithdrawTransactionHash, secretFromTxhash)
        flow.finishStep({
          isEthWithdrawn: true,
          secret: secretFromTxhash,
        }, {step: 'wait-withdraw-eth'})
      }
    })

    flow.swap.room.sendMessage({
      event: 'request ethWithdrawTxHash',
    })

    const { participant } = flow.swap

    const checkSecretExist = async () => {
      return await util.helpers.extractSecretFromContract({
        flow,
        swapFlow: abClass,
        participantAddress: abClass.getParticipantAddress(flow.swap),
        ownerAddress: abClass.getMyAddress(),
        app: abClass.app,
      })
    }

    const secretFromContract = await util.helpers.repeatAsyncUntilResult((stopRepeat) => {
      const { isEthWithdrawn, isRefunded } = flow.state

      if (isEthWithdrawn || isRefunded) {
        stopRepeat()

        return false
      }

      return checkSecretExist()
    })

    const { isEthWithdrawn } = flow.state

    if (secretFromContract && !isEthWithdrawn) {
      _debug('swap.core:flow')('got secret from smart contract', secretFromContract)

      flow.finishStep({
        isEthWithdrawn: true,
        secret: secretFromContract,
      }, { step: 'wait-withdraw-eth' })
    }
  }

  async waitABContract({
    flow,
    utxoCoin,
  }: {
    flow: any,
    utxoCoin: string,
  }) {
    const abClass = this

    flow.swap.room.sendMessage({
      event: 'request eth contract',
    })

    flow.swap.room.once(`request ${utxoCoin} script`, () => {
      const {
        utxoScriptValues: scriptValues,
        utxoScriptCreatingTransactionHash: txHash,
      } = flow.state

      flow.swap.room.sendMessage({
        event:  `create ${utxoCoin} script`,
        data: {
          scriptValues,
          utxoScriptCreatingTransactionHash: txHash,
        }
      })
    })

    const { participant } = flow.swap

    flow.swap.room.on('create eth contract', ({ ethSwapCreationTransactionHash }) => {
      flow.setState({
        ethSwapCreationTransactionHash,
      }, true)
    })

    const isContractBalanceOk = await this.isContractFunded(flow)

    if (isContractBalanceOk) {
      const { isEthContractFunded } = flow.state

      // @ToDo - нужно проверить сценарий, если был прерван свап
      // Мы остались на этом шаге, но при этом isEthContractFunded = true
      // Застрянет ли свап на этом шаге (#5)
      // Или нужно принудительно перевести на следующий шаг
      if (!isEthContractFunded) {
        flow.finishStep({
          isEthContractFunded: true,
        }, { step: 'wait-lock-eth' })
      }
    }
  }


  async isSwapCreated(data) {
    const {
      ownerAddress,
      participantAddress,
      secretHash,
    } = data

    const swap = await util.helpers.repeatAsyncUntilResult(() => {
      return this.contract.methods.swaps(ownerAddress, participantAddress).call()
    })

    return (swap && swap.secretHash && swap.secretHash === `0x${secretHash}`)
  }

  async isContractFunded(flow) {
    const abClass = this

    const isContractBalanceOk = await util.helpers.repeatAsyncUntilResult(async () => {
      const balance = await abClass.getBalance({
        ownerAddress: abClass.app.getParticipantEthAddress(flow.swap),
      })

      _debug('swap.core:flow')('Checking contract balance:', balance)

      const needContractBalance = new BigNumber(abClass.web3utils.toWei(flow.swap.buyAmount.toString()))

      if (new BigNumber(balance).isGreaterThanOrEqualTo(needContractBalance)) {
        return true
      } else {
        if (balance > 0) {
          console.warn(`Balance on contract is less than needed. Swap stucked. Contract balance: ${balance} Needed: ${needContractBalance.toString()}`)
        }
      }

      return false
    })

    if (isContractBalanceOk) {
      return true
    }
    return false
  }

  async checkTargetAddress({
    flow,
  }: {
    flow: any
  }) {
    if (this.hasTargetWallet()) {
      const targetWallet = await this.getTargetWallet(
        this.getParticipantAddress(flow.swap)
      )
      const needTargetWallet = (flow.swap.destinationBuyAddress)
        ? flow.swap.destinationBuyAddress
        : this.getMyAddress()

      if (targetWallet.toLowerCase() === needTargetWallet.toLowerCase()) {
        return true
      }
    }
    return false
  }

  async withdrawFromABContract({
    flow,
  }: {
    flow: any,
  }) {
    const abClass = this
    const { buyAmount, participant } = flow.swap
    const { secretHash, secret } = flow.state

    const data = {
      ownerAddress: abClass.getParticipantAddress(flow.swap),
      secret,
    }

    const balanceCheckError = await abClass.checkBalance({
      ownerAddress: abClass.getParticipantAddress(flow.swap),
      participantAddress: abClass.getMyAddress(),
      expectedValue: buyAmount,
      expectedHash: secretHash,
    })

    if (balanceCheckError) {
      console.error('Waiting until deposit: ETH balance check error:', balanceCheckError)
      flow.swap.events.dispatch('eth balance check error', balanceCheckError)

      return
    }

    if (flow.ethLikeSwap.hasTargetWallet()) {
      const targetWallet = await abClass.getTargetWallet(
        abClass.getParticipantAddress(flow.swap)
      )
      const needTargetWallet = (flow.swap.destinationBuyAddress)
        ? flow.swap.destinationBuyAddress
        : abClass.getMyAddress()

      if (targetWallet.toLowerCase() !== needTargetWallet.toLowerCase()) {
        console.error(
          'Destination address for ether dismatch with needed (Needed, Getted). Stop swap now!',
          needTargetWallet,
          targetWallet,
        )
        flow.swap.events.dispatch('address for ether invalid', {
          needed: needTargetWallet,
          getted: targetWallet,
        })

        return
      }
    }

    const onWithdrawReady = () => {
      flow.swap.room.once('request ethWithdrawTxHash', () => {
        const { ethSwapWithdrawTransactionHash } = flow.state

        flow.swap.room.sendMessage({
          event: 'ethWithdrawTxHash',
          data: {
            ethSwapWithdrawTransactionHash,
          },
        })
      })

      const { step } = flow.state

      if (step >= 7) {
        return
      }

      flow.finishStep({
        isEthWithdrawn: true,
      }, 'withdraw-eth')
    }

    const tryWithdraw = async (stopRepeater) => {
      const { isEthWithdrawn } = flow.state

      if (!isEthWithdrawn) {
        try {
          const { withdrawFee } = flow.state

          if (!withdrawFee) {
            const withdrawNeededGas = await abClass.calcWithdrawGas({
              ownerAddress: data.ownerAddress,
              secret,
            })
            flow.setState({
              withdrawFee: withdrawNeededGas,
            })
            _debug('swap.core:flow')('withdraw gas fee', withdrawNeededGas)
          }

          await abClass.withdraw(data, (hash) => {
            flow.setState({
              isEthWithdrawn: true,
              ethSwapWithdrawTransactionHash: hash,
              canCreateEthTransaction: true,
              requireWithdrawFee: false,
            }, true)

            flow.swap.room.sendMessage({
              event: 'ethWithdrawTxHash',
              data: {
                ethSwapWithdrawTransactionHash: hash,
              }
            })
          })

          stopRepeater()
          return true
        } catch (err) {
          if ( /known transaction/.test(err.message) ) {
            console.error(`known tx: ${err.message}`)
            stopRepeater()
            return true
          } else if ( /out of gas/.test(err.message) ) {
            console.error(`tx failed (wrong secret?): ${err.message}`)
          } else if ( /insufficient funds for gas/.test(err.message) ) {
            console.error(`insufficient fund for gas: ${err.message}`)

            _debug('swap.core:flow')('insufficient fund for gas... wait fund or request other side to withdraw')

            const { requireWithdrawFee } = flow.state

            if (!requireWithdrawFee) {
              flow.swap.room.once('withdraw ready', ({ethSwapWithdrawTransactionHash}) => {
                flow.setState({
                  ethSwapWithdrawTransactionHash,
                })

                onWithdrawReady()
              })

              flow.setState({
                requireWithdrawFee: true,
              })
            }

          } else {
            console.error(err)
          }

          flow.setState({
            canCreateEthTransaction: false,
          })

          return null
        }
      }

      return true
    }

    const isEthWithdrawn = await util.helpers.repeatAsyncUntilResult((stopRepeater) =>
      tryWithdraw(stopRepeater),
    )

    if (isEthWithdrawn) {
      onWithdrawReady()
    }
  }
}


export default EthLikeSwap
