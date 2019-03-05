import helpers, { request, constants, api } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import web3 from 'helpers/web3'
import reducers from 'redux/core/reducers'
import config from 'app-config'
import referral from './referral'
import { Keychain, web3Override } from 'keychain.js'
import { pubToAddress } from 'ethereumjs-util';


const login = (privateKey) => {
  let data

  if (privateKey) {
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
  }
  else {
    console.info('Created account Ethereum ...')
    data = web3.eth.accounts.create()
    localStorage.setItem(constants.localStorage.keychainActivated, false) // for deactivation of KeyChain
  }

  localStorage.setItem(constants.privateKeyNames.eth, data.privateKey)

  web3.eth.accounts.wallet.add(data.privateKey)
  reducers.user.setAuthData({ name: 'ethData', data })

  window.getEthAddress = () => data.address
  referral.newReferral(data.address)

  console.info('Logged in with Ethereum', data)

  return data.privateKey
}

const loginWithKeychain = async () => {
  const web3OverrideFunctions = web3Override(web3)
  web3.eth.accounts.sign = web3OverrideFunctions.sign
  web3.eth.accounts.signTransaction = web3OverrideFunctions.signTransaction

  const keychain = await Keychain.create()
  const selectKeyResult = await keychain.selectKey()
  const selectedKey = selectKeyResult.result
  const data = { privateKey: selectedKey, address: `0x${pubToAddress('0x' + selectedKey).toString('hex')}` }

  localStorage.setItem(constants.privateKeyNames.eth, data.privateKey)
  localStorage.setItem(constants.localStorage.keychainActivated, true)

  reducers.user.setAuthData({ name: 'ethData', data })

  window.getEthAddress = () => data.address

  console.info('Logged in with Ethereum', data)

  await getBalance()
  await getReputation()
  return selectedKey;
}

const getBalance = () => {
  const { user: { ethData: { address } } } = getState()
  return web3.eth.getBalance(address)
    .then(result => {
      const amount = web3.utils.fromWei(result)

      reducers.user.setBalance({ name: 'ethData', amount })
      return amount
    })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'ethData' })
    })
}

const getReputation = () =>
  new Promise(async (resolve, reject) => {
    const { user: { ethData: { address, privateKey } } } = getState()
    const addressOwnerSignature = web3.eth.accounts.sign(address, privateKey)

    request.post(`${api.getApiServer('swapsExplorer')}/reputation`, {
      json: true,
      body: {
        address,
        addressOwnerSignature,
      },
    }).then((response) => {
      const { reputation, reputationOracleSignature } = response

      reducers.user.setReputation({ name: 'ethData', reputation, reputationOracleSignature })
      resolve(reputation)
    }).catch((error) => {
      reject(error)
    })
  })

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

const send = ({ to, amount, gasPrice, gasLimit, speed } = {}) =>
  new Promise(async (resolve, reject) => {
    const { user: { ethData: { privateKey } } } = getState()

    gasPrice = gasPrice || await helpers.eth.estimateGasPrice({ speed })
    gasLimit = gasLimit || constants.defaultFeeRates.eth.limit.send

    const params = {
      to: String(to).trim(),
      gasPrice,
      gas: gasLimit,
      value: web3.utils.toWei(String(amount)),
    }

    const result = await web3.eth.accounts.signTransaction(params, privateKey)
    const receipt = web3.eth.sendSignedTransaction(result.rawTransaction)
      .on('transactionHash', (hash) => {
        const txId = `${config.link.etherscan}/tx/${hash}`
        console.log('tx', txId)
        actions.loader.show(true, { txId })
      })
      .on('error', (err) => {
        reject(err)
      })

    resolve(receipt)
  })

export default {
  send,
  login,
  loginWithKeychain,
  getBalance,
  fetchBalance,
  getTransaction,
  getReputation,
}
