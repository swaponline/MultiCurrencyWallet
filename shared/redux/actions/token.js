import abi from 'human-standard-token-abi'
import { request } from 'helpers'
import { getState } from 'redux/core'
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

const getBalance = () => {
  const { user: { ethData: { address } } } = getState()

  return request.get(`${config.api.etherscan}?module=account&action=tokenbalance&contractaddress=${noxonContract._address}&address=${address}`)
    .then(({ result: amount }) => {
      console.log('tokenAddress', noxonContract._address)
      console.log('result', amount)
      reducers.user.setBalance({ name: 'tokenData', amount })
    }).catch(r => console.error('Token service isn\'t available, try later'))
}

const fetchBalance = (address) =>
  request.get(`https://rinkeby.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x60c205722c6c797c725a996cf9cca11291f90749&address=${address}`)
    .then(({ result }) => result)


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
        if (res.status) {
          transactions = res.result
            .filter((item) => item.value > 0).map((item) => ({
              confirmations: item.confirmations > 0 ? 'Confirm' : 'Unconfirmed',
              type: item.tokenName,
              hash: item.hash,
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

const send = (from, to, amount) =>
  new Promise((resolve, reject) =>
    noxonContract.methods.transfer(to, amount).send()
      .then(receipt => {
        resolve(receipt)
      })
  )

export default {
  login,
  getBalance,
  getTransaction,
  send,
  fetchBalance,
}
