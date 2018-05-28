import abi from 'human-standard-token-abi'
import { request } from 'helpers'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import config from 'app-config'


let noxonContract

const setupContract = (ethAddress) => {
  if (!web3.eth.accounts.wallet[ethAddress]) {
    throw new Error('web3 does not have given address')
  }

  const options = {
    from: ethAddress,
    gas: `${config.services.web3.gas}`,
    gasPrice: `${config.services.web3.gasPrice}`,
  }

  noxonContract = new web3.eth.Contract(abi, config.services.web3.noxonToken, options)
  reducers.user.setTokenData({
    name: 'tokenData',
    contract: noxonContract,
    address: ethAddress,
  })
}

const login = (privateKey) => {
  let data
  if (privateKey) {
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
  } else {
    console.info('Created account ETH Token ...')
    data = web3.eth.accounts.create()
    web3.eth.accounts.wallet.add(data)
  }

  web3.eth.accounts.wallet.add(data.privateKey)
  console.info('Logged in with ETH Token', data)

  reducers.user.setAuthData({ name: 'tokenData', data })
  setupContract(data.address)
}

const getBalance = (ethAddress) =>
  request.get(`${config.api.etherscan}?module=account&action=tokenbalance&contractaddress=${noxonContract._address}&address=${ethAddress}`)
    .then(({ result: amount }) => {
      console.log('tokenAddress', noxonContract._address)
      console.log('result', amount)
      reducers.user.setBalance({ name: 'tokenData', amount })
    }).catch(r => console.error('Token service isn\'t available, try later'))

const getTransaction = (address) =>
  new Promise((resolve) => {
    const url = [
      `https://api-rinkeby.etherscan.io/api?module=account&action=tokentx`,
      `&contractaddress=${config.services.web3.noxonToken}`,
      `&address=${address}`,
      `&startblock=0&endblock=99999999`,
      `&sort=asc&apikey=${config.apiKeys.blocktrail}`,
    ].join('')

    let transactions

    request.get(url)
      .then((res) => {
        console.log('res', res)
        if (res.status) {
          transactions = res.result
            .filter((item) => item.value > 0).map((item) => ({
              type: item.tokenName,
              contractAddress: item.contractAddress,
              status: item.blockHash != null ? 1 : 0,
              value: item.value,
              address: item.to,
              date: item.timeStamp * 1000,
              direction: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out',
            }))
          resolve(transactions)
        } else { console.error('res:status ETH false', res) }
      })
  })

function withdraw(to, amount, contract) {

  if (this.balance <= 0) {
    throw new Error('Your balance is empty')

  }

  if (this.balance <= amount) {
    throw new Error('not enough money')

  }

  console.log('transfer amount', amount, 'to', to)
  let transfer = contract.methods.transfer(to, amount).send()

  console.log(transfer)

  return new Promise((resolve, reject) =>
    transfer
      .then(receipt => console.log('receipt', receipt))
      .then(hash => console.log('hash', hash))
      .then(confirmationNumber => console.log('confirmationNumber', confirmationNumber))
      .catch(error => console.log(error.message || error))
  )
}

const send = (from, amount, privateKey, to) =>
  new Promise((resolve, reject) => {
    web3.eth.getBalance(from).then((r) => {
      try {
        let balance = web3.utils.fromWei(r)
        if (balance === 0) {
          reject('Your balance is empty')
          return
        }

        let abi = [ {} ] // redacted on purpose
        let contract =  new web3.eth.Contract(abi, to)

        const receipt =  contract.methods.withdraw(to, amount, contract).send()
        return
      }
      catch (e) {
        console.error(e)
      }
    })
  })


export default {
  login,
  getBalance,
  getTransaction,
  withdraw,
  send,
}
