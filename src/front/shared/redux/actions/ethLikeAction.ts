import { BigNumber } from 'bignumber.js'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import * as mnemonicUtils from 'common/utils/mnemonic'
import typeforce from 'swap.app/util/typeforce'
import { web3, getWeb3 } from 'helpers/web3'
import externalConfig from 'helpers/externalConfig'
import metamask from 'helpers/metamask'
import helpers, {
  feedback,
  constants,
  cacheStorageGet,
  cacheStorageSet,
  apiLooper,
} from 'helpers'
import referral from './referral'

class EthLikeAction {
  private coinName: string
  private ticker: string // upper case (ex. ETH)
  private tickerKey: string // lower case (ex. eth)
  private ownerAddress: string
  private explorerName: string
  private explorerLink: string
  private explorerApiKey: string
  private adminFeeObj: {
    fee: string // percent of amount
    address: string // where to send
    min: string // min amount
  }

  private cache = new Map([
    ['addressIsContract', {}],
  ])

  constructor(options) {
    const {
      coinName,
      ticker,
      ownerAddress,
      explorerName,
      explorerLink,
      explorerApiKey,
      adminFeeObj,
    } = options

    this.coinName = coinName
    this.ticker = ticker
    this.tickerKey = ticker.toLowerCase()
    this.ownerAddress = ownerAddress
    this.explorerName = explorerName
    this.explorerLink = explorerLink
    this.explorerApiKey = explorerApiKey
    this.adminFeeObj = adminFeeObj
  }

  reportError = (error) => {
    feedback.actions.failed(''.concat(
      `details - ticker: ${this.ticker}, `,
      // `address: ${this.ownerAddress}, `,
      `error message - ${error.message} `,
    ))
    console.group(`Actions >%c ${this.ticker}`, 'color: red;')
    console.error('error: ', error)
    console.groupEnd()
  }

  getPrivateKeyByAddress = (address) => {
    const {
      user: {
        [`${this.tickerKey}Data`]: {
          address: oldAddress,
          privateKey,
        },
        [`${this.tickerKey}MnemonicData`]: {
          address: mnemonicAddress,
          privateKey: mnemonicKey,
        },
      },
    } = getState()

    if (oldAddress === address) return privateKey
    if (mnemonicAddress === address) return mnemonicKey
  }

  getInvoices = () => {
    return actions.invoices.getInvoices({
      currency: this.ticker,
      address: this.ownerAddress,
    })
  }
  
  getTx = (txRaw) => {
    return txRaw.transactionHash
  }

  getTxRouter = (txId) => {
    return `/${this.tickerKey}/tx/${txId}`
  }

  getLinkToInfo = (tx) => {
    if (!tx) return
    return `${this.explorerLink}/tx/${tx}`
  }

  fetchBalance = async (address): Promise<number> => {
    return web3.eth.getBalance(address)
      .then(result => Number(web3.utils.fromWei(result)))
      .catch(error => this.reportError(error))
  }

  fetchTxInfo = (hash, cacheResponse) => {
    const url = `?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${this.explorerApiKey}`

    return new Promise((res, rej) => {
      return apiLooper.get(this.explorerName, url, {
        cacheResponse,
      }).then((response: any) => {
          if (response && response.result) {
            const {
              from,
              to,
              value,
              gas,
              gasPrice,
              blockHash,
            } = response.result
    
            const amount = web3.utils.fromWei(value)
            const minerFee = new BigNumber(web3.utils.toBN(gas).toNumber())
              .multipliedBy(web3.utils.toBN(gasPrice).toNumber())
              .dividedBy(1e18)
              .toNumber()

            let adminFee: number | false = false

            if (this.adminFeeObj && to !== this.adminFeeObj.address) {
              const feeFromUsersAmount = new BigNumber(this.adminFeeObj.fee)
                .dividedBy(100)
                .multipliedBy(amount)
    
              if (new BigNumber(this.adminFeeObj.min).isGreaterThan(feeFromUsersAmount)) {
                adminFee = new BigNumber(this.adminFeeObj.min).toNumber()
              }
            }

            res({
              amount,
              afterBalance: null,
              receiverAddress: to,
              senderAddress: from,
              minerFee,
              minerFeeCurrency: this.ticker,
              adminFee,
              confirmed: (blockHash !== null),
            })
          } else {
            res(false)
          }
        })
        .catch((error) => {
          rej(error)
        })
    })
  }

  login = (privateKey, mnemonic = null, mnemonicKeys = null) => {
    let sweepToMnemonicReady = false

    if (
      privateKey
      && mnemonic
      && mnemonicKeys
      && mnemonicKeys[this.tickerKey] === privateKey
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

      const accData = this.getWalletByWords(mnemonic)
      privateKey = accData.privateKey
      data = web3.eth.accounts.privateKeyToAccount(privateKey)
      localStorage.setItem(constants.privateKeyNames[`${this.tickerKey}Mnemonic`], privateKey)
    }

    localStorage.setItem(constants.privateKeyNames[this.tickerKey], data.privateKey)

    web3.eth.accounts.wallet.add(data.privateKey)
    data.isMnemonic = sweepToMnemonicReady

    reducers.user.setAuthData({ name: `${this.tickerKey}Data`, data })
    // ? is referral need ?
    referral.newReferral(data.address)
  
    if (!sweepToMnemonicReady) {
      if (mnemonic === `-`) {
        this.reportError({
          message: 'Sweep. Can not auth. Need new mnemonic or enter own for re-login',
        })
        return
      }

      if (!mnemonicKeys || !mnemonicKeys[this.tickerKey]) {
        this.reportError({
          message: 'Sweep. Can not auth. Login key is undefined',
        })
        return
      }

      const mnemonicData = web3.eth.accounts.privateKeyToAccount(mnemonicKeys[this.tickerKey])

      web3.eth.accounts.wallet.add(mnemonicKeys[this.tickerKey])
      mnemonicData.isMnemonic = sweepToMnemonicReady

      reducers.user.addWallet({
        name: `${this.tickerKey}MnemonicData`,
        data: {
          currency: this.ticker,
          fullName: `${this.coinName} (New)`,
          balance: 0,
          isBalanceFetched: false,
          balanceError: null,
          infoAboutCurrency: null,
          ...mnemonicData,
        },
      })

      new Promise(async (resolve) => {
        const balance = await this.fetchBalance(mnemonicData.address)

        reducers.user.setAuthData({
          name: `${this.tickerKey}MnemonicData`,
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

  getBalance = () => {
    const address = metamask.isEnabled() && metamask.isConnected()
      ? metamask.getAddress()
      : this.ownerAddress

    const balanceInCache = cacheStorageGet('currencyBalances', `${this.tickerKey}_${address}`)
  
    if (balanceInCache !== false) {
      reducers.user.setBalance({
        name: `${this.tickerKey}Data`,
        amount: balanceInCache,
      })
      return balanceInCache
    }

    return this.fetchBalance(address)
      .then(balance => {
        cacheStorageSet('currencyBalances', `${this.tickerKey}_${address}`, balance, 30)
        reducers.user.setBalance({
          name: `${this.tickerKey}Data`,
          amount: balance,
        })
        return balance
      })
      .catch(() => {
        reducers.user.setBalanceError({ name: `${this.tickerKey}Data` })
      })
  }

  getAllMyAddresses = () => {
    const { user } = getState()
    const arrOfAddresses = []

    if (user[`${this.tickerKey}Data`]?.address) {
      arrOfAddresses.push(user[`${this.tickerKey}Data`].address.toLowerCase())
    }

    if (
      user[`${this.tickerKey}MnemonicData`]?.address?.toLowerCase() !==
      user[`${this.tickerKey}Data`]?.address?.toLowerCase()
    ) {
      arrOfAddresses.push(user[`${this.tickerKey}MnemonicData`]?.address?.toLowerCase())
    }
  
    if (
      metamask &&
      metamask.isEnabled() &&
      metamask.isConnected() &&
      !arrOfAddresses.includes(metamask.getAddress().toLowerCase())
    ) {
      arrOfAddresses.push(metamask.getAddress().toLowerCase())
    }

    return arrOfAddresses
  }

  getTransaction = (address: string = ``, ownType: string = ``) => {
    return new Promise((resolve) => {
      address = address || this.ownerAddress

      if (!typeforce.isCoinAddress[this.ticker](address)) {
        resolve([])
      }

      const type = ownType || this.tickerKey
      const internalUrl = `?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${this.explorerApiKey}`
      const url = `?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${this.explorerApiKey}`

      apiLooper.get(this.explorerName, internalUrl)
        .then((response: any) => {
          const internals = []

          response.result.forEach((item) => {
            const { value, to, hash } = item
            internals[hash] = {
              value,
              to,
            }
          })

          apiLooper.get(this.explorerName, url)
            .then((response: any) => {
              const transactions = response.result
                .filter((item) => {
                  return (
                    item.value > 0 ||
                    internals[item.hash] !== undefined &&
                    internals[item.hash].value > 0
                  )
                })
                .map((item) => ({
                  type,
                  confirmations: item.confirmations,
                  hash: item.hash,
                  status: item.blockHash !== null ? 1 : 0,
                  value: web3.utils.fromWei(
                    (internals[item.hash] !== undefined && internals[item.hash].value > 0)
                      ? internals[item.hash].value
                      : item.value
                  ),
                  address: item.to,
                  canEdit: address === this.ownerAddress,
                  date: item.timeStamp * 1000,
                  direction: (
                    internals[item.hash] !== undefined
                    && internals[item.hash].to.toLowerCase() === address.toLowerCase()
                      ? 'in'
                      : address.toLowerCase() === item.to.toLowerCase()
                        ? 'in'
                        : 'out'
                  ),
                }))
                .filter((item) => {
                  if (item.direction === 'in') return true
                  if (!this.adminFeeObj) return true
                  if (address.toLowerCase() === this.adminFeeObj.address.toLowerCase()) return true
                  if (item.address.toLowerCase() === this.adminFeeObj.address.toLowerCase()) return false

                  return true
                })

              resolve(transactions)
            })
            .catch((error) => {
              this.reportError(error)
              resolve([])
            })
        })
        .catch((error) => {
          this.reportError(error)
          resolve([])
        })
    })
  }

  getWalletByWords = (mnemonic: string, walletNumber: number = 0, path: string = '') => {
    return mnemonicUtils.getEthLikeWallet({ mnemonic, walletNumber, path })
  }

  getSweepAddress = () => {
    const { user } = getState()

    if (user[`${this.tickerKey}MnemonicData`]?.address) {
      return user[`${this.tickerKey}MnemonicData`].address
    }

    return false
  }

  send = async (params): Promise<object> => {
    let { to, amount, gasPrice, gasLimit, speed } = params
    const web3js = await getWeb3()
    const recipientIsContract = await this.isContract(to)

    gasPrice = 0 || await helpers[this.tickerKey].estimateGasPrice({ speed })
    gasLimit = gasLimit || (
      recipientIsContract
        // ? will use eth data for all ABBlockchains ?
        ? DEFAULT_CURRENCY_PARAMETERS.eth.limit.contractInteract
        : DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
    )
      
    let sendMethod = web3js.eth.sendTransaction
    let txObject = {
      from: this.ownerAddress,
      to: to.trim(),
      gasPrice,
      gas: gasLimit,
      value: web3.utils.toWei(String(amount)),
    }
    const walletData = actions.core.getWallet({
      address: this.ownerAddress,
      currency: this.ticker,
    })
    const privateKey = this.getPrivateKeyByAddress(this.ownerAddress)

    if (!walletData.isMetamask) {
      const signedTx = await web3js.eth.accounts.signTransaction(txObject, privateKey)
      txObject = signedTx.rawTransaction
      sendMethod = web3js.eth.sendSignedTransaction
    }

    return new Promise((res, rej) => {
      const receipt = sendMethod(txObject)
        .on('transactionHash', (hash) => res({ transactionHash: hash }))
        .on('error', (error) => rej(error))

      // Admin fee transaction
      if (this.adminFeeObj && !walletData.isMetamask) {
        receipt.then(() => {
          this.sendAdminFee({
            amount,
            gasPrice,
            gasLimit,
            privateKey,
          })
        })
      }
    })
  }

  sendAdminFee = async (params) => {
    const web3js = await getWeb3()
    const { amount, gasPrice, gasLimit, privateKey } = params

    const minAmount = new BigNumber(this.adminFeeObj.min)
    let feeFromUsersAmount = new BigNumber(this.adminFeeObj.fee)
      .dividedBy(100) // 100 %
      .multipliedBy(amount)
      .toNumber()
    
    if (minAmount.isGreaterThan(feeFromUsersAmount)) {
      feeFromUsersAmount = minAmount.toNumber()
    }

    const adminFeeParams = {
      to: this.adminFeeObj.address.trim(),
      gasPrice,
      gas: gasLimit,
      value: web3js.utils.toWei(String(feeFromUsersAmount)),
    }

    return new Promise(async () => {
      const signedTxObj = await web3js.eth.accounts.signTransaction(adminFeeParams, privateKey)
    
      web3js.eth.sendSignedTransaction(signedTxObj.rawTransaction)
        .on('transactionHash', (hash) => {
          console.group('%c Admin commission is sended', 'color: green;')
          console.log('tx hash', hash)
          console.groupEnd()
        })
    })
  }

  // TODO: Seems we use this method in the TurboSwaps
  // TODO: need to replace it with this.send() method
  sendTransaction = async (params) => {
    const { to, amount } = params

    if (false) { // fake tx - turboswaps debug
      const txHash = '0x58facdbf5023a401f39998179995f0af1e54a64455145df6ed507abdecc1b0a4'
      return txHash
    }

    return await this.send({
      from: this.ownerAddress,
      to,
      amount,
    })
  }

  sweepToMnemonic = (mnemonic, path) => {
    // ? what's that, how does it work ? Wrong arguments order. Check this.getWalletByWords method
    const wallet = this.getWalletByWords(mnemonic, path)

    window.localStorage.setItem(
      constants.privateKeyNames[`${this.tickerKey}Mnemonic`],
      wallet.privateKey,
    )

    return wallet.privateKey
  }

  isSweeped = () => {
    const { user } = getState()

    if (
      user[`${this.tickerKey}Data`]?.address?.toLowerCase() !==
      user[`${this.tickerKey}MnemonicData`]?.address?.toLowerCase()
    ) {
      return false
    }

    return true
  }

  isContract = async (address: string): Promise<boolean> => {
    const lowerAddress = address.toLowerCase()

    if (this.cache.get('addressIsContract')[lowerAddress]) {
      return this.cache.get('addressIsContract')[lowerAddress]
    }

    const codeAtAddress = await web3.eth.getCode(address)
    const codeIsEmpty = !codeAtAddress || codeAtAddress === '0x' || codeAtAddress === '0x0'
  
    this.cache.get('addressIsContract')[lowerAddress] = !codeIsEmpty
    return !codeIsEmpty
  }
}

const {
  user: {
    ethData: { address: ethOwnerAddress },
    bnbData: { address: bnbOwnerAddress },
  }
} = getState()

export default {
  ETH: new EthLikeAction({
    coinName: 'Ethereum',
    ticker: 'ETH',
    ownerAddress: ethOwnerAddress,
    explorerName: 'etherscan',
    explorerLink: externalConfig.link.etherscan,
    explorerApiKey: externalConfig.api.etherscan_ApiKey,
    adminFeeObj: externalConfig.opts?.fee?.eth,
  }),
  BNB: new EthLikeAction({
    coinName: 'Binance Coin',
    ticker: 'BNB',
    ownerAddress: bnbOwnerAddress,
    explorerName: 'bscscan',
    explorerLink: externalConfig.link.bscscan,
    explorerApiKey: externalConfig.api.bscscan_ApiKey,
    adminFeeObj: externalConfig.opts?.fee?.bnb,
  }),
}