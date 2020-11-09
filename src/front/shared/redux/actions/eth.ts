import helpers, { apiLooper, constants, api, cacheStorageGet, cacheStorageSet } from 'helpers'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import { getWeb3 } from 'helpers/web3'
import { utils as web3utils } from 'web3'
import reducers from 'redux/core/reducers'
import config from 'helpers/externalConfig'
import referral from './referral'
import { pubToAddress } from 'ethereumjs-util'
import { hdkey } from 'ethereumjs-wallet'
import * as bip39 from 'bip39'
import typeforce from 'swap.app/util/typeforce'
import { BigNumber } from 'bignumber.js'
import { default as mnemonicUtils } from '../../../../common/utils/mnemonic'

import metamask from 'helpers/metamask'


const web3 = getWeb3()


const hasAdminFee = (
  config
    && config.opts
    && config.opts.fee
    && config.opts.fee.eth
    && config.opts.fee.eth.fee
    && config.opts.fee.eth.address
    && config.opts.fee.eth.min
) ? config.opts.fee.eth : false

const getRandomMnemonicWords = () => bip39.generateMnemonic()
const validateMnemonicWords = (mnemonic) => bip39.validateMnemonic(mnemonicUtils.convertMnemonicToValid(mnemonic))

const sweepToMnemonic = (mnemonic, path) => {
  const wallet = getWalletByWords(mnemonic, path)
  localStorage.setItem(constants.privateKeyNames.ethMnemonic, wallet.privateKey)
  return wallet.privateKey
}

const isSweeped = () => {
  const {
    user: {
      ethData,
      ethMnemonicData,
    },
  } = getState()

  if (ethMnemonicData
    && ethMnemonicData.address
    && ethData
    && ethData.address
    && ethData.address.toLowerCase() !== ethMnemonicData.address.toLowerCase()
  ) return false

  return true
}

const getAllMyAddresses = () => {
  const {
    user: {
      ethData,
      ethMnemonicData,
    },
  } = getState()

  const retData = [ethData.address.toLowerCase()]

  if (ethMnemonicData
    && ethMnemonicData.address
    && ethMnemonicData.address.toLowerCase() !== ethData.address.toLowerCase()
  ) retData.push(ethMnemonicData.address.toLowerCase())

  return retData
}

const getSweepAddress = () => {
  const {
    user: {
      ethMnemonicData,
    },
  } = getState()

  if (ethMnemonicData && ethMnemonicData.address) return ethMnemonicData.address
  return false
}

const getPrivateKeyByAddress = (address) => {
  const {
    user: {
      ethData: {
        address: oldAddress,
        privateKey,
      },
      ethMnemonicData: {
        address: mnemonicAddress,
        privateKey: mnemonicKey,
      },
    },
  } = getState()

  if (oldAddress === address) return privateKey
  if (mnemonicAddress === address) return mnemonicKey
}

const getWalletByWords = (mnemonic, walletNumber = 0, path) => {
  // in eth address are equals in all networds
  return mnemonicUtils.getEthWallet('nothing', mnemonic, walletNumber, path)
}


const login = (privateKey, mnemonic, mnemonicKeys) => {
  let sweepToMnemonicReady = false

  if (privateKey
    && mnemonic
    && mnemonicKeys
    && mnemonicKeys.eth === privateKey
  ) {
    sweepToMnemonicReady = true
  }

  if (!privateKey && mnemonic) {
    sweepToMnemonicReady = true
  }

  let data

  if (privateKey) {
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
  } else {
    console.info('Created account Ethereum ...')
    // data = web3.eth.accounts.create()
    if (!mnemonic) {
      mnemonic = bip39.generateMnemonic()
    }
    const accData = getWalletByWords(mnemonic)
    console.log('Eth. Generated walled from random 12 words')
    console.log(accData)
    privateKey = accData.privateKey
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
    localStorage.setItem(constants.privateKeyNames.ethMnemonic, privateKey)
  }

  localStorage.setItem(constants.privateKeyNames.eth, data.privateKey)

  web3.eth.accounts.wallet.add(data.privateKey)
  data.isMnemonic = sweepToMnemonicReady

  reducers.user.setAuthData({ name: 'ethData', data })

  window.getEthAddress = () => data.address
  referral.newReferral(data.address)

  console.info('Logged in with Ethereum', data)

  if (!sweepToMnemonicReady) {
    // Auth with our mnemonic account
    if (mnemonic === `-`) {
      console.error('Sweep. Cant auth. Need new mnemonic or enter own for re-login')
      return
    }

    if (!mnemonicKeys
      || !mnemonicKeys.eth
    ) {
      console.error('Sweep. Cant auth. Login key undefined')
      return
    }

    const mnemonicData = web3.eth.accounts.privateKeyToAccount(mnemonicKeys.eth)
    web3.eth.accounts.wallet.add(mnemonicKeys.eth)
    mnemonicData.isMnemonic = sweepToMnemonicReady

    console.info('Logged in with Ethereum Mnemonic', mnemonicData)
    reducers.user.addWallet({
      name: 'ethMnemonicData',
      data: {
        currency: 'ETH',
        fullName: 'Ethereum (New)',
        balance: 0,
        isBalanceFetched: false,
        balanceError: null,
        infoAboutCurrency: null,
        ...mnemonicData,
      },
    })
    new Promise(async (resolve) => {
      const balance = await fetchBalance(mnemonicData.address)
      reducers.user.setAuthData({
        name: 'ethMnemonicData',
        data: {
          balance,
          isBalanceFetched: true,
        },
      })
      resolve(true)
    })
  }

  return data.privateKey
}

const isETHAddress = (address) => {
  const { user: { ethData } } = getState()
  if (ethData && ethData.address && ethData.address.toLowerCase() === address.toLowerCase()) return ethData
}

const getBalance = () => {
  const {
    user: {
      ethData: {
        address: ethAddress,
      },
    },
  } = getState()

  const address = (metamask.isEnabled() && metamask.isConnected()) ? metamask.getAddress() : ethAddress

  const balanceInCache = cacheStorageGet('currencyBalances', `eth_${address}`)
  if (balanceInCache !== false) {
    reducers.user.setBalance({
      name: 'ethData',
      amount: balanceInCache,
    })
    return balanceInCache
  }

  return web3.eth.getBalance(address)
    .then(result => {
      const amount = web3.utils.fromWei(result)

      cacheStorageSet('currencyBalances', `eth_${address}`, amount, 30)
      reducers.user.setBalance({ name: 'ethData', amount })
      return amount
    })
    .catch((e) => {
      reducers.user.setBalanceError({ name: 'ethData' })
    })
}

const getReputation = () => Promise.resolve(0)

const fetchBalance = (address) =>
  web3.eth.getBalance(address)
    .then(result => Number(web3.utils.fromWei(result)))
    .catch((e) => {
      console.log('Web3 doesn\'t work please again later ', e.error)
    })

const getInvoices = (address) => {
  const { user: { ethData: { userAddress } } } = getState()

  address = address || userAddress

  return actions.invoices.getInvoices({
    currency: 'ETH',
    address,
  })
}

const getTx = (txRaw) => txRaw.transactionHash

const getTxRouter = (txId) => `/eth/tx/${txId}`

const getLinkToInfo = (tx) => {
  if (!tx) {
    return
  }

  return `https://etherscan.io/tx/${tx}`
}

const getTransaction = (address, ownType) =>
  new Promise((resolve) => {
    const { user: { ethData: { address: userAddress } } } = getState()
    address = address || userAddress

    if (!typeforce.isCoinAddress.ETH(address)) {
      resolve([])
    }

    const type = (ownType) || 'eth'

    const url = `?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.api.etherscan_ApiKey}`

    return apiLooper.get('etherscan', url)
      .then((res) => {
        const transactions = res.result
          .filter((item) => item.value > 0)
          .map((item) => ({
            type,
            confirmations: item.confirmations,
            hash: item.hash,
            status: item.blockHash != null ? 1 : 0,
            value: web3.utils.fromWei(item.value),
            address: item.to,
            canEdit: address === userAddress,
            date: item.timeStamp * 1000,
            direction: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out',
          }))
          .filter((item) => {
            if (item.direction === 'in') return true
            if (!hasAdminFee) return true
            if (address.toLowerCase() === hasAdminFee.address.toLowerCase()) return true
            if (item.address.toLowerCase() === hasAdminFee.address.toLowerCase()) return false

            return true
          })

        resolve(transactions)
      })
      .catch(() => {
        resolve([])
      })
  })

const send = (data) => {
  return (hasAdminFee) ? sendWithAdminFee(data) : sendDefault(data)
}

const sendWithAdminFee = async ({ from, to, amount, gasPrice, gasLimit, speed } = {}) => {
  const web3js = getWeb3()

  const {
    fee: adminFee,
    address: adminFeeAddress,
    min: adminFeeMinValue,
  } = config.opts.fee.eth

  const adminFeeMin = BigNumber(adminFeeMinValue)

  // fee - from amount - percent
  let feeFromAmount = BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

  feeFromAmount = feeFromAmount.toNumber() // Admin fee

  gasPrice = gasPrice || await helpers.eth.estimateGasPrice({ speed })
  gasLimit = gasLimit || constants.defaultFeeRates.eth.limit.send

  const walletData = actions.core.getWallet({
    address: from,
    currency: 'ETH',
  })

  const privateKey = (!walletData.isMetamask) ? getPrivateKeyByAddress(from) : false

  return new Promise(async (resolve, reject) => {
    const params = {
      from,
      to: String(to).trim(),
      gasPrice,
      gas: gasLimit,
      value: web3utils.toWei(String(amount)),
    }

    let rawTx
    if (!walletData.isMetamask) {
      const signedTx = await web3js.eth.accounts.signTransaction(params, privateKey)
      rawTx = signedTx.rawTransaction
    }

    const receipt = web3js.eth[
      walletData.isMetamask
        ? 'sendTransaction'
        : 'sendSignedTransaction'
    ](walletData.isMetamask ? params : rawTx)
      .on('transactionHash', (hash) => {
        const txId = `${config.link.etherscan}/tx/${hash}`
        console.log('tx', txId)
        actions.loader.show(true, { txId })
      })
      .on('error', (err) => {
        reject(err)
      })


    receipt.then(() => {
      resolve(receipt)
      if (!walletData.isMetamask) {
        // Withdraw admin fee
        new Promise(async (resolve, reject) => {
          const adminFeeParams = {
            to: String(adminFeeAddress).trim(),
            gasPrice,
            gas: gasLimit,
            value: web3utils.toWei(String(feeFromAmount)),
          }

          let resultAdminFee = false
          if (walletData.isMetamask) {
            resultAdminFee = await web3js.eth.accounts.signTransaction(adminFeeParams)
          } else {
            resultAdminFee = await web3js.eth.accounts.signTransaction(adminFeeParams, privateKey)
          }
          const receiptAdminFee = web3js.eth.sendSignedTransaction(resultAdminFee.rawTransaction)
            .on('transactionHash', (hash) => {
              console.log('Eth admin fee tx', hash)
            })
        })
      }
    })
  })
}

const sendDefault = ({ from, to, amount, gasPrice, gasLimit, speed } = {}) => {
  return new Promise(async (resolve, reject) => {
    const web3js = getWeb3()

    gasPrice = gasPrice || await helpers.eth.estimateGasPrice({ speed })
    gasLimit = gasLimit || constants.defaultFeeRates.eth.limit.send

    const params = {
      from,
      to: String(to).trim(),
      gasPrice,
      gas: gasLimit,
      value: web3.utils.toWei(String(amount)),
    }

    const walletData = actions.core.getWallet({
      address: from,
      currency: 'ETH',
    })

    const privateKey = (!walletData.isMetamask) ? getPrivateKeyByAddress(from) : false

    let rawTx
    if (!walletData.isMetamask) {
      const signedTx = await web3js.eth.accounts.signTransaction(params, privateKey)
      rawTx = signedTx.rawTransaction
    }

    const receipt = web3js.eth[
      walletData.isMetamask
        ? 'sendTransaction'
        : 'sendSignedTransaction'
    ](walletData.isMetamask ? params : rawTx)
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
}

const fetchTxInfo = (hash, cacheResponse) => new Promise((resolve) => {
  const url = `?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${config.api.etherscan_ApiKey}`

  return apiLooper.get('etherscan', url, {
    cacheResponse,
  })
    .then((res) => {
      if (res && res.result) {
        const {
          from,
          to,
          value,
          gas,
          gasPrice,
          blockHash,
        } = res.result

        const amount =  web3.utils.fromWei(value)

        // Calc miner fee, used for this tx
        const minerFee = BigNumber(web3.utils.toBN(gas).toNumber())
          .multipliedBy(web3.utils.toBN(gasPrice).toNumber())
          .dividedBy(1e18).toNumber()

        let adminFee = false

        if (hasAdminFee && to != hasAdminFee.address) {
          adminFee = BigNumber(hasAdminFee.fee).dividedBy(100).multipliedBy(amount)
          if (BigNumber(hasAdminFee.min).isGreaterThan(adminFee)) adminFee = BigNumber(hasAdminFee.min)
          adminFee = adminFee.toNumber()
        }

        resolve({
          amount,
          afterBalance: null,
          receiverAddress: to,
          senderAddress: from,
          minerFee,
          minerFeeCurrency: 'ETH',
          adminFee,
          confirmed: (blockHash != null),
        })

      } else {
        resolve(false)
      }
    })
    .catch(() => {
      resolve(false)
    })
})

export default {
  send,
  login,
  getBalance,
  fetchBalance,
  getTransaction,
  getReputation,
  getInvoices,
  getTx,
  getLinkToInfo,
  isETHAddress,
  getWalletByWords,
  getRandomMnemonicWords,
  validateMnemonicWords,
  sweepToMnemonic,
  isSweeped,
  getSweepAddress,
  getAllMyAddresses,
  fetchTxInfo,
  getTxRouter,
}
