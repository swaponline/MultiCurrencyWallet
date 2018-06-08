import { env } from '../util'


class EthTokenSwap {

  // reputation: 0x527458d3d3a3af763dbe2ccc5688d64161e81d97

  constructor({ gasLimit }) {
    this.gasLimit   = gasLimit
    this.address    = '0x527458d3d3a3af763dbe2ccc5688d64161e81d97'
    this.abi        = [ { "constant": false, "inputs": [ { "name": "_ownerAddress", "type": "address" } ], "name": "abort", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "close", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_secretHash", "type": "bytes20" }, { "name": "_participantAddress", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_token", "type": "address" } ], "name": "createSwap", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "refund", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_ratingContractAddress", "type": "address" } ], "name": "setReputationAddress", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "sign", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "constant": false, "inputs": [ { "name": "_secret", "type": "bytes32" }, { "name": "_ownerAddress", "type": "address" } ], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" } ], "name": "checkSign", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "getInfo", "outputs": [ { "name": "", "type": "address" }, { "name": "", "type": "bytes32" }, { "name": "", "type": "bytes20" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_participantAddress", "type": "address" } ], "name": "getSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" }, { "name": "", "type": "address" } ], "name": "participantSigns", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "ratingContractAddress", "outputs": [ { "name": "", "type": "address" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" }, { "name": "", "type": "address" } ], "name": "swaps", "outputs": [ { "name": "token", "type": "address" }, { "name": "secret", "type": "bytes32" }, { "name": "secretHash", "type": "bytes20" }, { "name": "createdAt", "type": "uint256" }, { "name": "balance", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "_ownerAddress", "type": "address" }, { "name": "_participantAddress", "type": "address" } ], "name": "unsafeGetSecret", "outputs": [ { "name": "", "type": "bytes32" } ], "payable": false, "stateMutability": "view", "type": "function" } ]
    this.contract   = new env.web3.eth.Contract(this.abi, this.address)

    this.ERC20Address   = '0x60c205722c6c797c725a996cf9cca11291f90749'
    this.ERC20Abi       = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"getBurnPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unlockEmission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"emissionlocked","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"lockEmission","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"burnAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newManager","type":"address"}],"name":"changeManager","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"emissionPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"addToReserve","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"burnPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"amount","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"NoxonInit","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"acceptManagership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"ethers","type":"uint256"},{"indexed":false,"name":"_emissionedPrice","type":"uint256"},{"indexed":false,"name":"amountOfTokens","type":"uint256"}],"name":"TokenBought","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"ethers","type":"uint256"},{"indexed":false,"name":"_burnedPrice","type":"uint256"},{"indexed":false,"name":"amountOfTokens","type":"uint256"}],"name":"TokenBurned","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"etherReserved","type":"uint256"}],"name":"EtherReserved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}],
    this.ERC20          = new env.web3.eth.Contract(this.ERC20Abi, this.ERC20Address)
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

      console.log('\n\nStart sign ETH Token Swap', { values: { ownerAddress: myAddress, participantAddress } })

      const receipt = await this.contract.methods.sign(participantAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Token Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Token Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Token Swap > error', err)
          reject(err)
        })

      console.log('ETH Token Swap sign complete:', receipt)
      resolve(receipt)
    })
  }

  approve({ myAddress, amount }, handleTransaction) {
    return new Promise((resolve, reject) => {
      console.log('\n\nStart approve ERC20 Swap')

      this.ERC20.methods.approve(this.address, amount).send({
        from: myAddress,
        gas: this.gasLimit,
      })
        .on('transactionHash', (hash) => {
          console.log('ERC20 Approve > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('receipt', receipt => {
          resolve(receipt)

          this.checkAllowance({
            myAddress,
            owner: myAddress,
            spender: this.address,
          })
            .then((result) => {
              console.log('*********************')
              console.log('Allowance:', result)
              console.log('*********************')
            })
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ERC20 Swap > confirmation', confirmationNumber)
        })
        .on('error', err => {
          // console.error(err)
          reject(err)
        })
    })
  }

  checkAllowance({ myAddress, owner, spender }) {
    return new Promise(async (resolve, reject) => {
      let result

      try {
        result = await this.ERC20.methods.allowance(owner, spender).call({
          from: myAddress,
        })
      }
      catch (err) {
        reject(err)
      }

      resolve(result)
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
    return new Promise((resolve, reject) => {
      const hash = `0x${secretHash.replace(/^0x/, '')}`

      const params = {
        from: myAddress,
        gas: this.gasLimit,
      }

      const values = [ hash, participantAddress, amount, this.ERC20Address ]

      console.log('\n\nStart creating ETH Token Swap', { values, params })

      this.contract.methods.createSwap(...values).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Token Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('receipt', (receipt) => {
          console.log('ETH Token Swap created:', receipt)
          resolve(receipt)

          this.getInfo({
            myAddress,
            participantAddress
          })
            .then((result) => {
              console.log('*********************')
              console.log('Swap info:', result)
              console.log('*********************')
            })
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Token Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Token Swap > error', err)
          reject(err)
        })
    })
  }

  getInfo({ myAddress, participantAddress }) {
    return new Promise(async (resolve, reject) => {
      let info

      try {
        info = await this.contract.methods.getInfo(myAddress, participantAddress).call({
          from: myAddress,
        })
      }
      catch (err) {
        reject(err)
      }

      resolve(info)
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
    return new Promise((resolve, reject) => {
      const secret = `0x${_secret.replace(/^0x/, '')}`

      const params = {
        from: myAddress,
        gas: this.gasLimit,
        // gasPrice: config.eth.gasPrice,
      }

      console.log('\n\nStart withdraw from ERC20 Swap', { values: { secret, ownerAddress }, params })

      this.contract.methods.withdraw(secret, ownerAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ERC20 Withdraw > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('receipt', receipt => {
          resolve(receipt)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ERC20 Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          reject(err)
        })
    })
  }

  refund() {

  }

  // ETH Owner receive a secret
  getSecret({ myAddress, participantAddress }) {
    return new Promise(async (resolve, reject) => {
      console.log('\n\nStart getting secret from ETH Token Swap')

      let secret

      try {
        secret = await this.contract.methods.getSecret(participantAddress).call({
          from: myAddress,
        })
      }
      catch (err) {
        reject(err)
      }

      console.log('ETH Token Swap secret:', secret)
      resolve(secret)
    })
  }

  // ETH Owner closes Swap to receive reputation
  close({ myAddress, participantAddress }, handleTransaction) {
    return new Promise(async (resolve, reject) => {
      console.log('\n\nStart closing ETH Token Swap')

      const params = {
        from: myAddress,
        gas: this.gasLimit,
        // gasPrice: config.eth.gasPrice,
      }

      const receipt = await this.contract.methods.close(participantAddress).send(params)
        .on('transactionHash', (hash) => {
          console.log('ETH Token Swap > transactionHash', `https://rinkeby.etherscan.io/tx/${hash}`)
          handleTransaction && handleTransaction(`https://rinkeby.etherscan.io/tx/${hash}`)
        })
        .on('confirmation', (confirmationNumber) => {
          // console.log('ETH Token Swap > confirmation', confirmationNumber)
        })
        .on('error', (err) => {
          console.error('ETH Token Swap > error', err)
          reject(err)
        })

      console.log('ETH Token Swap closed')
      resolve(receipt)
    })
  }
}


export default EthTokenSwap
