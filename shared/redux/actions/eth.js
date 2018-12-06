import { request, constants, api } from 'helpers'
import { getState } from 'redux/core'
import  actions from 'redux/actions'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import config from 'app-config'
import referral from './referral'


const login = (privateKey) => {
  let data

  if (privateKey) {
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
  }
  else {
    console.info('Created account Ethereum ...')
    data = web3.eth.accounts.create()
  }

  localStorage.setItem(constants.privateKeyNames.eth, data.privateKey)

  web3.eth.accounts.wallet.add(data.privateKey)
  reducers.user.setAuthData({ name: 'ethData', data })

  window.getEthAddress = () => data.address
  referral.newReferral(data.address)

  console.info('Logged in with Ethereum', data)

  return data.privateKey
}

const getBalance = () => {
  const { user: { ethData: { address } } } = getState()
  return web3.eth.getBalance(address)
    .then(result => {
      const amount = Number(web3.utils.fromWei(result))

      reducers.user.setBalance({ name: 'ethData', amount })
      return amount
    })
    .catch((e) => {
      console.log('Web3 doesn\'t work please again later ',  e.error)
    })
}

const fetchBalance = (address) =>
  web3.eth.getBalance(address)
    .then(result => Number(web3.utils.fromWei(result)))
    .catch((e) => {
      console.log('Web3 doesn\'t work please again later ', e.error)
    })


const getTransaction = () =>
  new Promise((resolve) => {
    const { user: { ethData: { address } } } = getState()

    const url = `${api.getApiServer('etherscan')}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=RHHFPNMAZMD6I4ZWBZBF6FA11CMW9AXZNM`

    return request.get(url)
      .then((res) => {
        const transactions = res.result
          .filter((item) => item.value > 0).map((item) => ({
            type: 'eth',
            confirmations: item.confirmations,
            hash: item.hash,
            status: item.blockHash != null ? 1 : 0,
            value: web3.utils.fromWei(item.value),
            address: item.to,
            date: item.timeStamp * 1000,
            direction: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out',
          }))

        resolve(transactions)
      })
      .catch(() => {
        resolve([])
      })
  })

const send = (from, to, amount) =>
  new Promise(async (resolve, reject) => {
    const { user: { ethData: { privateKey } } } = getState()

    const params = {
      to: String(to).trim(),
      gasPrice: '20000000000',
      gas: '21000',
      value: web3.utils.toWei(String(amount)),
    }
    let txRaw

    await web3.eth.accounts.signTransaction(params, privateKey)
      .then(result => {
        txRaw = web3.eth.sendSignedTransaction(result.rawTransaction)
      })

    const receipt = await txRaw.on('transactionHash', (hash) => {
      const txId = `${config.link.etherscan}/tx/${hash}`
      actions.loader.show(true, true, txId)
    })
      .on('error', (err) => {
        reject(err)
      })

    resolve(receipt)
  })


export default {
  send,
  login,
  getBalance,
  fetchBalance,
  getTransaction,
}
