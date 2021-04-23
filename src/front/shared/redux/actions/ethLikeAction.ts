import { BigNumber } from 'bignumber.js'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import * as mnemonicUtils from 'common/utils/mnemonic'
import { web3, getWeb3 } from 'helpers/web3'
import externalConfig from 'helpers/externalConfig'
import metamask from 'helpers/metamask'
import helpers, {
  feedback,
  constants,
  cacheStorageGet,
  cacheStorageSet,
} from 'helpers'

class EthLikeAction {
  private ticker: string // upper case (ex. ETH)
  private tickerKey: string // lower case (ex. eth)
  private ownerAddress: string
  private precision: number // number of digits after the dot
  private explorerLink: string
  private adminFeeObj: {
    feePercent: string // percent of amount
    address: string // where to send
    minAmount: string // min amount
  }

  constructor(options) {
    const {
      ticker,
      precision,
      ownerAddress,
      explorerLink,
      adminFeeObj,
    } = options

    this.ticker = ticker
    this.tickerKey = ticker.toLowerCase()
    this.precision = precision
    this.ownerAddress = ownerAddress
    this.explorerLink = explorerLink
    this.adminFeeObj = adminFeeObj
  }

  reportError = (error) => {
    feedback.actions.failed(`details(ticker: ${this.ticker}); message(${error.message})`)
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
        reducers.user.setBalance({ name: `${this.tickerKey}Data`, balance })
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

  send = async (params): Promise<string> => {
    let { to, amount, gasPrice, gasLimit, speed } = params
    const web3js = await getWeb3()
    const recipientIsContract = await addressIsContract(to)

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
      sendMethod = web3js.eth.sendSignedTransaction
      txObject = signedTx.rawTransaction
    }

    return new Promise((res, rej) => {
      const receipt = sendMethod(txObject)
        // TODO: in this response the hash equals undefined
        .on('transactionHash', (hash) => res(`${this.explorerLink}/tx/${hash}`))
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

  // TODO: check this method
  sendAdminFee = async (params) => {
    const web3js = await getWeb3()
    const { amount, gasPrice, gasLimit, privateKey } = params

    const minAmount = new BigNumber(this.adminFeeObj.minAmount)
    let sendedFeeAmount = new BigNumber(this.adminFeeObj.feePercent)
      .dividedBy(100) // 100 %
      .multipliedBy(amount)
      .toNumber()
    
    if (minAmount.isGreaterThan(sendedFeeAmount)) {
      sendedFeeAmount = minAmount.toNumber()
    }

    const adminFeeParams = {
      to: this.adminFeeObj.address.trim(),
      gasPrice,
      gas: gasLimit,
      value: web3js.utils.toWei(String(sendedFeeAmount)),
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
    // ? what's that, how does it work ? Wrong arguments order. See above method
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

  /* 
  login
  getTransaction
  fetchTxInfo
  */
}

// ? move it into common (used only eth, bnb actions)
const _addressIsContractCache = {}

const addressIsContract = async (address: string): Promise<boolean> => {
  const lowerAddress = address.toLowerCase()

  if (_addressIsContractCache[lowerAddress]) {
    return _addressIsContractCache[lowerAddress]
  }

  const codeAtAddress = await web3.eth.getCode(address)
  const codeIsEmpty = !codeAtAddress || codeAtAddress === '0x' || codeAtAddress === '0x0'

  _addressIsContractCache[lowerAddress] = !codeIsEmpty
  return !codeIsEmpty
}

const {
  user: {
    ethData: { address: ethOwnerAddress },
    bnbData: { address: bnbOwnerAddress },
  }
} = getState()

// ? it will be easier if we'll export to lowecase (no changes to the other files)
export default {
  ETH: new EthLikeAction({
    ticker: 'ETH',
    precision: 18,
    ownerAddress: ethOwnerAddress,
    explorerLink: externalConfig.link?.etherscan,
    adminFeeObj: externalConfig.opts?.fee?.eth,
  }),
  BNB: new EthLikeAction({
    ticker: 'BNB',
    precision: 18,
    ownerAddress: bnbOwnerAddress,
    explorerLink: externalConfig.link?.bscscan,
    adminFeeObj: externalConfig.opts?.fee?.bnb,
  }),
}