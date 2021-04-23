import { getState } from 'redux/core'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import helpers, { apiLooper, constants, cacheStorageGet, cacheStorageSet } from 'helpers'
import { web3, getWeb3 } from 'helpers/web3'
import config from 'helpers/externalConfig'
//@ts-ignore
import { utils as web3utils } from 'web3'
import referral from './referral'
import typeforce from 'swap.app/util/typeforce'
import { BigNumber } from 'bignumber.js'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import * as mnemonicUtils from 'common/utils/mnemonic'

import metamask from 'helpers/metamask'


const hasAdminFee = (
  config
  && config.opts?.fee?.bnb?.fee
  && config.opts?.fee?.bnb?.address
  && config.opts?.fee?.bnb?.min
) ? config.opts.fee.bnb : false

const sweepToMnemonic = (mnemonic, path) => {
  const wallet = getWalletByWords(mnemonic, path)
  localStorage.setItem(constants.privateKeyNames.bnbMnemonic, wallet.privateKey)
  return wallet.privateKey
}

const isSweeped = () => {
  const {
    user: {
      bnbData,
      bnbMnemonicData,
    },
  } = getState()

  if (bnbMnemonicData
    && bnbMnemonicData.address
    && bnbData
    && bnbData.address
    && bnbData.address.toLowerCase() !== bnbMnemonicData.address.toLowerCase()
  ) return false

  return true
}

const getAllMyAddresses = () => {
  const {
    user: {
      bnbData,
      bnbMnemonicData,
    },
  } = getState()

  const retData = [bnbData.address.toLowerCase()]

  if (bnbMnemonicData
    && bnbMnemonicData.address
    && bnbMnemonicData.address.toLowerCase() !== bnbData.address.toLowerCase()
  ) retData.push(bnbMnemonicData.address.toLowerCase())

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
      bnbMnemonicData,
    },
  } = getState()

  if (bnbMnemonicData && bnbMnemonicData.address) return bnbMnemonicData.address
  return false
}

const getPrivateKeyByAddress = (address) => {
  const {
    user: {
      bnbData: {
        address: oldAddress,
        privateKey,
      },
      bnbMnemonicData: {
        address: mnemonicAddress,
        privateKey: mnemonicKey,
      },
    },
  } = getState()

  if (oldAddress === address) return privateKey
  if (mnemonicAddress === address) return mnemonicKey
}

const getWalletByWords = (mnemonic: string, walletNumber: number = 0, path: string = '') => {
  return mnemonicUtils.getEthLikeWallet({ mnemonic, walletNumber, path })
}


const login = (privateKey, mnemonic = null, mnemonicKeys = null) => {
  let sweepToMnemonicReady = false

  if (privateKey
    && mnemonic
    && mnemonicKeys
    && mnemonicKeys.bnb === privateKey
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
    if (!mnemonic) {
      mnemonic = mnemonicUtils.getRandomMnemonicWords()
    }

    const accData = getWalletByWords(mnemonic)
    privateKey = accData.privateKey
    data = web3.eth.accounts.privateKeyToAccount(privateKey)
    localStorage.setItem(constants.privateKeyNames.bnbMnemonic, privateKey)
  }

  localStorage.setItem(constants.privateKeyNames.bnb, data.privateKey)

  web3.eth.accounts.wallet.add(data.privateKey)
  data.isMnemonic = sweepToMnemonicReady

  reducers.user.setAuthData({ name: 'bnbData', data })
  window.getBnbAddress = () => data.address
  referral.newReferral(data.address)

  if (!sweepToMnemonicReady) {
    // Auth with our mnemonic account
    if (mnemonic === `-`) {
      console.error('Sweep. Cant auth. Need new mnemonic or enter own for re-login')
      return
    }

    if (!mnemonicKeys
      || !mnemonicKeys.bnb
    ) {
      console.error('Sweep. Cant auth. Login key undefined')
      return
    }

    const mnemonicData = web3.eth.accounts.privateKeyToAccount(mnemonicKeys.bnb)
    web3.eth.accounts.wallet.add(mnemonicKeys.bnb)
    //@ts-ignore
    mnemonicData.isMnemonic = sweepToMnemonicReady

    console.info('Logged in with Binance Mnemonic', mnemonicData)
    reducers.user.addWallet({
      name: 'bnbMnemonicData',
      data: {
        currency: 'BNB',
        fullName: 'Binance Coin (New)',
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
        name: 'bnbMnemonicData',
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
      bnbData: {
        address: bnbAddress,
      },
    },
  } = getState()

  const address = metamask.isEnabled() && metamask.isConnected()
    ? metamask.getAddress()
    : bnbAddress

  const balanceInCache = cacheStorageGet('currencyBalances', `bnb_${address}`)

  if (balanceInCache !== false) {
    reducers.user.setBalance({
      name: 'bnbData',
      amount: balanceInCache,
    })
    return balanceInCache
  }

  return web3.eth.getBalance(address)
    .then(result => {
      const amount = web3.utils.fromWei(result)

      cacheStorageSet('currencyBalances', `bnb_${address}`, amount, 30)
      reducers.user.setBalance({ name: 'bnbData', amount })
      return amount
    })
    .catch(() => {
      reducers.user.setBalanceError({ name: 'bnbData' })
    })
}

const fetchBalance = (address) => 
  web3.eth.getBalance(address)
    .then(result => Number(web3.utils.fromWei(result)))
    .catch((e) => {
      console.log('Web3 doesn\'t work please again later ', e.error)
    })

const getInvoices = (address) => {
  const { user: { bnbData: { userAddress } } } = getState()

  address = address || userAddress

  return actions.invoices.getInvoices({
    currency: 'BNB',
    address,
  })
}

const getTx = (txRaw) => txRaw.transactionHash

const getTxRouter = (txId) => `/bnb/tx/${txId}`

const getLinkToInfo = (tx) => {
  if (!tx) {
    return
  }

  return `${config.link.bscscan}/tx/${tx}`
}

const getTransaction = (address: string = ``, ownType: string = ``) =>
  new Promise((resolve) => {
    const { user: { bnbData: { address: userAddress } } } = getState()
    address = address || userAddress

    if (!typeforce.isCoinAddress.BNB(address)) {
      resolve([])
    }

    const type = (ownType) || 'bnb'
    // First - get internal txs
    const internalUrl = `?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.api.bscscan_ApiKey}`
    const url = `?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${config.api.bscscan_ApiKey}`

    apiLooper.get('bscscan', internalUrl)
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
        apiLooper.get('bscscan', url)
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
            console.warn(`Fail get txs for BNB ${address}`, e)
            resolve([])
          })
      })
      .catch((e) => {
        console.warn(`Fail get txs for BNB ${address}`, e)
        resolve([])
      })
  })

const send = (data) => {
  const metamaskEnable = metamask.isEnabled() && metamask.isConnected()

  return hasAdminFee && !metamaskEnable 
    ? sendWithAdminFee(data)
    : sendDefault(data)
}

const sendWithAdminFee = async ({ from, to, amount, gasPrice, gasLimit }) => {
  const web3js = await getWeb3()

  const {
    fee: adminFeePercent,
    address: adminFeeAddress,
    min: minFee,
  } = config.opts.fee.bnb

  const adminMinFee = new BigNumber(minFee)

  const isSendToContract = await addressIsContract(to)
  // fee - from amount - percent
  let feeFromAmount = new BigNumber(adminFeePercent)
    .dividedBy(100)
    .multipliedBy(amount)
    .toNumber()
  
  if (adminMinFee.isGreaterThan(feeFromAmount)) {
    feeFromAmount = adminMinFee.toNumber()
  }

  gasPrice = gasPrice || await helpers.bnb.estimateGasPrice()

  const mainGasLimit = gasLimit || (
    isSendToContract
      ? DEFAULT_CURRENCY_PARAMETERS.eth.limit.contractInteract
      : DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
  )
  const serviceFeeGasLimit = gasLimit || DEFAULT_CURRENCY_PARAMETERS.eth.limit.send

  const walletData = actions.core.getWallet({
    address: from,
    currency: 'BNB',
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

    const receipt = web3js.eth[
      walletData.isMetamask
        ? 'sendTransaction'
        : 'sendSignedTransaction'
    ](walletData.isMetamask ? params : rawTx)
      .on('transactionHash', (hash) => {
        const txId = `${config.link.bscscan}/tx/${hash}`
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
            value: web3utils.toWei(String(adminMinFee)),
          }

          if (walletData.isMetamask) {
            await web3js.eth.accounts.signTransaction(adminFeeParams)
          } else {
            await web3js.eth.accounts.signTransaction(adminFeeParams, privateKey)
          }
          //@ts-ignore ? where's resultAdminFee
          web3js.eth.sendSignedTransaction(resultAdminFee.rawTransaction)
            .on('transactionHash', (hash) => {
              console.log('BNB admin fee tx', hash)
            })
        })
      }
    })
  })
}

const sendDefault = async ({ from, to, amount, gasPrice = null, gasLimit = null, speed = null }) => {
  const web3js = getWeb3()
  const isSendToContract = await addressIsContract(to)

  return new Promise(async (resolve, reject) => {
    //@ts-ignore
    gasPrice = gasPrice || await helpers.bnb.estimateGasPrice({ speed })
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
      currency: 'BNB',
    })

    const privateKey = (!walletData.isMetamask) ? getPrivateKeyByAddress(from) : false

    let rawTx
    if (!walletData.isMetamask) {
      const signedTx = await web3js.eth.accounts.signTransaction(params, privateKey)
      rawTx = signedTx.rawTransaction
    }

    const bnbDispatchMethod = web3js.eth[
      walletData.isMetamask
        ? 'sendTransaction'
        : 'sendSignedTransaction'
    ]
    const receipt = bnbDispatchMethod(walletData.isMetamask ? params : rawTx)
      .on('transactionHash', (hash) => {
        const txId = `${config.link.bscscan}/tx/${hash}`
        console.log('tx', txId)
      })
      .on('error', (error) => {
        reject(error)
      })

    resolve(receipt)
  })
}
// TODO: turbo swap
const sendTransaction = async ({ to, amount }) => {
  // from main BNB wallet

  const { user: { bnbData: { address } } } = getState()

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
  if (_addressIsContractCache[checkAddress.toLowerCase()] !== undefined) {
    return _addressIsContractCache[checkAddress.toLowerCase()]
  }

  const codeAtAddress = await web3.eth.getCode(checkAddress)
  const codeIsEmpty = !codeAtAddress || codeAtAddress === '0x' || codeAtAddress === '0x0'

  _addressIsContractCache[checkAddress.toLowerCase()] = !codeIsEmpty

  return !codeIsEmpty
}

const fetchTxInfo = (hash, cacheResponse) => new Promise((resolve) => {
  const url = `?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${config.api.bscscan_ApiKey}`

  return apiLooper.get('bscscan', url, {
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
        const minerFee = new BigNumber(web3.utils.toBN(gas).toNumber())
          .multipliedBy(web3.utils.toBN(gasPrice).toNumber())
          .dividedBy(1e18)
          .toNumber()

        let adminFee: any = false

        if (hasAdminFee && to != hasAdminFee.address) {
          adminFee = new BigNumber(hasAdminFee.fee).dividedBy(100).multipliedBy(amount)

          if (new BigNumber(hasAdminFee.min).isGreaterThan(adminFee)) {
            adminFee = new BigNumber(hasAdminFee.min)
          }

          adminFee = adminFee.toNumber()
        }

        resolve({
          amount,
          afterBalance: null,
          receiverAddress: to,
          senderAddress: from,
          minerFee,
          minerFeeCurrency: 'BNB',
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
  getInvoices,
  getTx,
  getLinkToInfo,
  getWalletByWords,
  sweepToMnemonic,
  isSweeped,
  getSweepAddress,
  getAllMyAddresses,
  fetchTxInfo,
  sendTransaction,
  getTxRouter,
  addressIsContract,
}
