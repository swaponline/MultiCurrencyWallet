import { getState } from 'redux/core'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import helpers, { apiLooper, constants, cacheStorageGet, cacheStorageSet } from 'helpers'
import { web3, getWeb3 } from 'helpers/web3'
import config from 'helpers/externalConfig'
//@ts-ignore
import { utils as web3utils } from 'web3'
import referral from './referral'
import * as bip39 from 'bip39'
import typeforce from 'swap.app/util/typeforce'
import { BigNumber } from 'bignumber.js'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import * as mnemonicUtils from 'common/utils/mnemonic'

import metamask from 'helpers/metamask'


const ethLabel = (config.binance) ? 'Binance Chain' : 'Ethereum'
const ethLabelShort = (config.binance) ? 'BNB' : 'ETH'

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

  if (metamask
    && metamask.isEnabled()
    && metamask.isConnected()
    && retData.indexOf(metamask.getAddress().toLowerCase()) === -1
  ) {
    retData.push(metamask.getAddress().toLowerCase())
  }

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

const getWalletByWords = (mnemonic: string, walletNumber: number = 0, path: string = '') => {
  // in eth address are equals in all networds
  return mnemonicUtils.getEthWallet('nothing', mnemonic, walletNumber, path)
}


const login = (privateKey, mnemonic = null, mnemonicKeys = null) => {
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
    console.log('Eth. Generated wallet from random 12 words')
    console.log(accData)
    privateKey = accData.privateKey
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
    localStorage.setItem(constants.privateKeyNames.ethMnemonic, privateKey)
  }

  localStorage.setItem(constants.privateKeyNames.eth, data.privateKey)

  web3.eth.accounts.wallet.add(data.privateKey)
  data.isMnemonic = sweepToMnemonicReady

  data = {
    ...data,
    fullName: ethLabel,
    currency: ethLabelShort,
  }

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
    //@ts-ignore
    mnemonicData.isMnemonic = sweepToMnemonicReady

    console.info('Logged in with Ethereum Mnemonic', mnemonicData)
    reducers.user.addWallet({
      name: 'ethMnemonicData',
      data: {
        currency: ethLabelShort,
        fullName: `${ethLabel} (New)`,
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

  return `${config.link.etherscan}/tx/${tx}`
}

const getTransaction = (address: string = ``, ownType: string = ``) =>
  new Promise((resolve) => {
    const { user: { ethData: { address: userAddress } } } = getState()
    address = address || userAddress

    if (!typeforce.isCoinAddress.ETH(address)) {
      resolve([])
    }

    const type = (ownType) || (config.binance) ? 'bnb' : 'eth'
    // First - get internal txs
    const internalUrl = `?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.api.etherscan_ApiKey}`
    const url = `?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.api.etherscan_ApiKey}`

    apiLooper.get('etherscan', internalUrl)
      .then((res:any) => {
        const internals : Array<any> = []
        res.result
          .map((item) => {
            const { value, to } = item
            internals[item.hash] = {
              value,
              to,
            }
          })
        apiLooper.get('etherscan', url)
          .then((res:any) => {
            const transactions = res.result
              .filter((item) => {
                return (item.value > 0) || (internals[item.hash] !== undefined && internals[item.hash].value > 0)
              })
              .map((item) => ({
                type,
                confirmations: item.confirmations,
                hash: item.hash,
                status: item.blockHash != null ? 1 : 0,
                value: web3.utils.fromWei(
                  (internals[item.hash] !== undefined && internals[item.hash].value > 0)
                    ? internals[item.hash].value
                    : item.value
                ),
                address: item.to,
                canEdit: address === userAddress,
                date: item.timeStamp * 1000,
                direction: (
                  (
                    internals[item.hash] !== undefined
                    && internals[item.hash].to.toLowerCase() == address.toLowerCase()
                  )
                  ? 'in'
                  : address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out'
                ),
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
          .catch((e) => {
            console.warn(`Fail get txs for ETH ${address}`, e)
            resolve([])
          })
      })
      .catch((e) => {
        console.warn(`Fail get txs for ETH ${address}`, e)
        resolve([])
      })
  })

const send = (data) => {
  const metamaskEnable = metamask.isEnabled() && metamask.isConnected()

  return hasAdminFee && !metamaskEnable 
    ? sendWithAdminFee(data)
    : sendDefault(data)
}

const sendWithAdminFee = async ({ from, to, amount, gasPrice, gasLimit, speed }) => {
  const web3js = await getWeb3()

  const {
    fee: adminFee,
    address: adminFeeAddress,
    min: adminFeeMinValue,
  } = config.opts.fee.eth

  const adminFeeMin = new BigNumber(adminFeeMinValue)

  const isSendToContract = await addressIsContract(to)
  // fee - from amount - percent
  let feeFromAmount = new BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
  if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin

  //@ts-ignore
  feeFromAmount = feeFromAmount.toNumber() // Admin fee

  gasPrice = gasPrice || await helpers.eth.estimateGasPrice({ speed })

  const mainGasLimit = gasLimit || (
    isSendToContract
      ? DEFAULT_CURRENCY_PARAMETERS.eth.limit.contractInteract
      : DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
  )
  const serviceFeeGasLimit = gasLimit || DEFAULT_CURRENCY_PARAMETERS.eth.limit.send

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
      gas: mainGasLimit,
      value: web3utils.toWei(String(amount)),
    }

    let rawTx
    if (!walletData.isMetamask) {
      const signedTx = await web3js.eth.accounts.signTransaction(params, privateKey)
      rawTx = signedTx.rawTransaction
    }
    //@ts-ignore
    const receipt = web3js.eth[
      walletData.isMetamask
        ? 'sendTransaction'
        : 'sendSignedTransaction'
    ](walletData.isMetamask ? params : rawTx)
      .on('transactionHash', (hash) => {
        const txId = `${config.link.etherscan}/tx/${hash}`
        console.log('tx', txId)
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
            gas: serviceFeeGasLimit,
            value: web3utils.toWei(String(feeFromAmount)),
          }

          let resultAdminFee = false
          if (walletData.isMetamask) {
            //@ts-ignore
            resultAdminFee = await web3js.eth.accounts.signTransaction(adminFeeParams)
          } else {
            //@ts-ignore
            resultAdminFee = await web3js.eth.accounts.signTransaction(adminFeeParams, privateKey)
          }
          //@ts-ignore
          const receiptAdminFee = web3js.eth.sendSignedTransaction(resultAdminFee.rawTransaction)
            .on('transactionHash', (hash) => {
              console.log('Eth admin fee tx', hash)
            })
        })
      }
    })
  })
}

const sendDefault = ({ from, to, amount, gasPrice = null, gasLimit = null, speed = null }) => {
  return new Promise(async (resolve, reject) => {
    const web3js = getWeb3()

    const isSendToContract = await addressIsContract(to)

    gasPrice = gasPrice || await helpers.eth.estimateGasPrice({ speed })
    gasLimit = gasLimit || (
      isSendToContract
        ? DEFAULT_CURRENCY_PARAMETERS.eth.limit.contractInteract
        : DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
    )

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

    const ethDispatchMethod = web3js.eth[
      walletData.isMetamask
        ? 'sendTransaction'
        : 'sendSignedTransaction'
    ]
    const receipt = ethDispatchMethod(walletData.isMetamask ? params : rawTx)
      .on('transactionHash', (hash) => {
        const txId = `${config.link.etherscan}/tx/${hash}`
        console.log('tx', txId)
      })
      .on('error', (error) => {
        reject(error)
      })

    resolve(receipt)
  })
}

const sendTransaction = async ({ to, amount }) => {
  // from main eth wallet

  const { user: { ethData: { address } } } = getState()

  if (false) { // fake tx - turboswaps debug
    const txHash = '0x58facdbf5023a401f39998179995f0af1e54a64455145df6ed507abdecc1b0a4'
    return txHash
  }

  const receipt = await sendDefault({
    from: address,
    to,
    amount,
  })

  // @ts-ignore
  // todo: IReceipt (?)
  const txHash = receipt.transactionHash

  return txHash
}

const _addressIsContractCache = {} // Remember prev checks - for speed up
const addressIsContract = async (checkAddress: string): Promise<boolean> => {
  if (_addressIsContractCache[checkAddress.toLowerCase()] !== undefined) return _addressIsContractCache[checkAddress.toLowerCase()]
  const codeAtAddress = await web3.eth.getCode(checkAddress)
  const codeIsEmpty = !codeAtAddress || codeAtAddress === '0x' || codeAtAddress === '0x0'

  _addressIsContractCache[checkAddress.toLowerCase()] = !codeIsEmpty

  return !codeIsEmpty
}

const fetchTxInfo = (hash, cacheResponse) => new Promise((resolve) => {
  const url = `?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${config.api.etherscan_ApiKey}`

  return apiLooper.get('etherscan', url, {
    cacheResponse,
  })
    .then((res: any) => {
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
        const minerFee = new BigNumber(web3.utils.toBN(gas).toNumber())
          .multipliedBy(web3.utils.toBN(gasPrice).toNumber())
          .dividedBy(1e18).toNumber()

        let adminFee: any = false

        if (hasAdminFee && to != hasAdminFee.address) {
          adminFee = new BigNumber(hasAdminFee.fee).dividedBy(100).multipliedBy(amount)

          if (new BigNumber(hasAdminFee.min).isGreaterThan(adminFee)) adminFee = new BigNumber(hasAdminFee.min)

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
  getWalletByWords,
  getRandomMnemonicWords,
  validateMnemonicWords,
  sweepToMnemonic,
  isSweeped,
  getSweepAddress,
  getAllMyAddresses,
  fetchTxInfo,
  sendTransaction,
  getTxRouter,
  addressIsContract,
}
