import { request, constants, api } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
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
      reducers.user.setBalanceError({ name: 'ethData' })
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

const send = (from, to, amount, { gasPrice, gasLimit } = {}) =>
  new Promise(async (resolve, reject) => {
    const { user: { ethData: { privateKey, gasRate } } } = getState()

    if (!gasPrice) {
      gasPrice = gasRate.price.normal
    }

    if (!gasLimit) {
      gasLimit = gasRate.limit
    }

    const params = {
      to: String(to).trim(),
      gasPrice: gasPrice * 1000000000,
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

const getGasRate = async () => {
  const link = config.feeRates.eth
  const defaultPrice = constants.defaultFeeRates.eth.price

  if (!link) {
    return defaultPrice
  }

  const apiResult = await request.get(link)

  const apiRate = {
    slow: apiResult.safeLow,
    normal: apiResult.standard,
    fast: apiResult.fast,
  }

  const currentRate = {
    slow: apiRate.slow >= defaultPrice.slow ? apiRate.slow : defaultPrice.slow,
    normal: apiRate.normal >= defaultPrice.slow ? apiRate.normal : defaultPrice.normal,
    fast: apiRate.fast >= defaultPrice.slow ? apiRate.fast : defaultPrice.fast,
  }

  return currentRate
}

const setGasRate = async ({ limit, slow, normal, fast } = {}) => {
  const currentRate = await getGasRate()
  const gasRate = {
    limit: Number(limit) >= constants.defaultFeeRates.eth.limit
      ? limit
      : constants.defaultFeeRates.eth.limit,
    price: {
      slow: slow ? slow : currentRate.slow,
      normal: normal ? normal : currentRate.normal,
      fast: fast ? fast : currentRate.fast,
    },
  }

  reducers.user.setGasRate({ gasRate })
}

export default {
  send,
  login,
  getBalance,
  fetchBalance,
  getTransaction,
  getGasRate,
  setGasRate,
}
