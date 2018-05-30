import { env } from '../util'


class EthSwap {

  constructor({ gasLimit }) {
    this.gasLimit   = gasLimit
    this.address    = '0xe08907e0e010a339646de2cc56926994f58c4db2'
    this.abi        = [ { 'constant': false, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'abort', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'close', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_secretHash', 'type': 'bytes20' }, { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'createSwap', 'outputs': [], 'payable': true, 'stateMutability': 'payable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'refund', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_ratingContractAddress', 'type': 'address' } ], 'name': 'setReputationAddress', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': false, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'sign', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'inputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor' }, { 'constant': false, 'inputs': [ { 'name': '_secret', 'type': 'bytes32' }, { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'withdraw', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' } ], 'name': 'checkSign', 'outputs': [ { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' }, { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'getInfo', 'outputs': [ { 'name': '', 'type': 'bytes32' }, { 'name': '', 'type': 'bytes20' }, { 'name': '', 'type': 'uint256' }, { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'getSecret', 'outputs': [ { 'name': '', 'type': 'bytes32' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'owner', 'outputs': [ { 'name': '', 'type': 'address' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '', 'type': 'address' }, { 'name': '', 'type': 'address' } ], 'name': 'participantSigns', 'outputs': [ { 'name': '', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'ratingContractAddress', 'outputs': [ { 'name': '', 'type': 'address' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '', 'type': 'address' }, { 'name': '', 'type': 'address' } ], 'name': 'swaps', 'outputs': [ { 'name': 'secret', 'type': 'bytes32' }, { 'name': 'secretHash', 'type': 'bytes20' }, { 'name': 'createdAt', 'type': 'uint256' }, { 'name': 'balance', 'type': 'uint256' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' }, { 'constant': true, 'inputs': [ { 'name': '_ownerAddress', 'type': 'address' }, { 'name': '_participantAddress', 'type': 'address' } ], 'name': 'unsafeGetSecret', 'outputs': [ { 'name': '', 'type': 'bytes32' } ], 'payable': false, 'stateMutability': 'view', 'type': 'function' } ]
    this.contract   = new env.web3.eth.Contract(this.abi, this.address)
  }

  /**
   *
   * @param {object} data
   * @param {object} data.myAddress
   * @param {string} data.participantAddress
   * @param {function} handleTransaction
   */
  sign({ myAddress, participantAddress }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      const params = {
        from: myAddress,
        gas: this.gasLimit,
      }

      console.log('\n\nStart sign ETH Swap', { values: { ownerAddress: myAddress, participantAddress } })

      const receipt = await this.contract.methods.sign(participantAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Swap > error', err)
          reject(err)
        })

      console.log('ETH Swap sign complete:', receipt)
      resolve(receipt)
    })
  }

  /**
   *
   * @param {object} data
   * @param {object} data.myAddress
   * @param {string} data.secretHash
   * @param {string} data.participantAddress
   * @param {number} data.amount
   * @param {function} handleTransaction
   */
  create({ myAddress, secretHash, participantAddress, amount }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      const hash      = `0x${secretHash.replace(/^0x/, '')}`

      const params = {
        from: myAddress,
        gas: this.gasLimit,
        // gasPrice: config.eth.gasPrice,
        value: Math.floor(env.web3.utils.toWei(String(amount))),
      }

      const values = [ hash, participantAddress ]

      console.log('\n\nStart creating ETH Swap', { values, params })

      const receipt = await this.contract.methods.createSwap(...values).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Swap > error', err)
          reject(err)
        })

      console.log('ETH Swap created:', receipt)
      resolve(receipt)
    })
  }

  /**
   *
   * @param {object} data
   * @param {object} data.myAddress
   * @param {string} data.secret
   * @param {string} data.ownerAddress
   * @param {function} handleTransaction
   */
  withdraw({ myAddress, ownerAddress, secret: _secret }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      const secret = `0x${_secret.replace(/^0x/, '')}`

      const params = {
        from: myAddress,
        gas: this.gasLimit,
        // gasPrice: config.eth.gasPrice,
      }

      console.log('\n\nStart withdraw from ETH Swap', { values: { secret, ownerAddress }, params })

      const receipt = await this.contract.methods.withdraw(secret, ownerAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Swap > error', err)
          reject(err)
        })

      console.log('ETH Swap withdraw complete:', receipt)
      resolve(receipt)
    })
  }

  refund() {

  }

  // ETH Owner receive a secret
  getSecret({ myAddress, participantAddress }) {
    return new Promise(async (resolve, reject) => {
      console.log('\n\nStart getting secret from ETH Swap')

      let secret

      try {
        secret = await this.contract.methods.getSecret(participantAddress).call({
          from: myAddress,
        })
      }
      catch (err) {
        reject(err)
      }

      console.log('ETH Swap secret:', secret)
      resolve(secret)
    })
  }

  // ETH Owner closes Swap to receive reputation
  close({ myAddress, participantAddress }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      console.log('\n\nStart closing ETH Swap')

      const params = {
        from: myAddress,
        gas: this.gasLimit,
        // gasPrice: config.eth.gasPrice,
      }

      const receipt = await this.contract.methods.close(participantAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Swap > error', err)
          reject(err)
        })

      console.log('ETH Swap closed')
      resolve(receipt)
    })
  }
}


export default EthSwap
