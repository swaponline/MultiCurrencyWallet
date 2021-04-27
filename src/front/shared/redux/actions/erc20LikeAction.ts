import InputDataDecoder from 'ethereum-input-data-decoder'
import TokenAbi from 'human-standard-token-abi'
import { BigNumber } from 'bignumber.js'
import { getState } from 'redux/core'
import actions from 'redux/actions'
import reducers from 'redux/core/reducers'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import erc20tokens from 'common/erc20tokens'
import helpers, {
  apiLooper,
  constants,
  cacheStorageGet,
  cacheStorageSet,
  feedback,
} from 'helpers'
import externalConfig from 'helpers/externalConfig'
import { web3 } from 'helpers/web3'
import metamask from 'helpers/metamask'

const NETWORK = process.env.MAINNET ? 'mainnet' : 'testnet'
const Decoder = new InputDataDecoder(TokenAbi)

class Erc20LikeAction {
  private currency: string
  private currencyKey: string
  private type: string // (ex. ERC20)
  private explorerName: string
  private explorerLink: string
  private explorerApiKey: string
  private adminFeeObj: {
    fee: string // percent of amount
    address: string // where to send
    min: string // min amount
  }

  constructor(params) {
    const {
      currency,
      type,
      explorerName,
      explorerLink,
      explorerApiKey,
      adminFeeObj,
    } = params

    this.currency = currency
    this.currencyKey = currency.toLowerCase()
    this.type = type
    this.explorerName = explorerName
    this.explorerLink = explorerLink
    this.explorerApiKey = explorerApiKey
    this.adminFeeObj = adminFeeObj
  }

  reportError = (error) => {
    feedback.actions.failed(''.concat(
      `details - type: ${this.type}, `,
      `error message - ${error.message} `,
    ))
    console.group(`Actions >%c ${this.type}`, 'color: red;')
    console.error('error: ', error)
    console.groupEnd()
  }

  // TODO: better name - addToken. Rename after intergation with bep20
  AddCustomERC20 = (contract, symbol, decimals) => {
    let customTokens = JSON.parse(localStorage.getItem(constants.localStorage.customERC))
  
    if (!customTokens) {
      customTokens = {
        mainnet: {},
        testnet: {},
      }
    }

    customTokens[NETWORK][contract] = {
      address: contract,
      symbol,
      decimals,
    }

    localStorage.setItem(constants.localStorage.customERC, JSON.stringify(customTokens))
  }

  // TODO: better name - getToken. Rename after intergation with bep20
  GetCustromERC20 = () => {
    let tokensInfo = JSON.parse(localStorage.getItem(constants.localStorage.customERC))

    if (!tokensInfo || !tokensInfo[NETWORK]) return {}
    return tokensInfo[NETWORK]
  }

  getTx = (txRaw) => {
    return txRaw.transactionHash
  }

  getTxRouter = (txId, currency) => {
    // TODO: change with '/<erc20|bep20|...>/<token name>/tx/<tx id>'
    return `/token/${currency.toUpperCase()}/tx/${txId}`
  }

  getLinkToInfo = (tx) => {
    if (!tx) return
    return `${this.explorerLink}/tx/${tx}`
  }

  getBalance = async (tokenName) => {
    if (tokenName === undefined) return
  
    const { user: { tokensData } } = getState()
    const {
      address: internalAddress,
      contractAddress,
      decimals,
      name,
    } = tokensData[tokenName.toLowerCase()]
  
    const address = (metamask.isConnected()) ? metamask.getAddress() : false || internalAddress
    const balanceInCache = cacheStorageGet('currencyBalances', `token_${tokenName}_${address}`)
  
    if (balanceInCache !== false) {
      reducers.user.setTokenBalance({
        name,
        amount: balanceInCache,
      })
      return balanceInCache
    }
  
    const ERC20 = new web3.eth.Contract(TokenAbi, contractAddress)
  
    try {
      const result = await ERC20.methods.balanceOf(address).call()
      let amount = new BigNumber(String(result)).dividedBy(new BigNumber(String(10)).pow(decimals)).toString()
      
      reducers.user.setTokenBalance({ name, amount })
      cacheStorageSet('currencyBalances', `token_${tokenName}_${address}`, amount, 60)

      return amount
    } catch (error) {
      this.reportError(error)
      reducers.user.setTokenBalanceError({ name })
    }
  }

  getTransaction = (ownAddress, tokenName) => {
    return new Promise((res) => {
      const { user: { tokensData } } = getState()
      const { address = ownAddress, contractAddress } = tokensData[tokenName.toLowerCase()]
      const url = ''.concat(
        `?module=account&action=tokentx`,
        `&contractaddress=${contractAddress}`,
        `&address=${address}`,
        `&startblock=0&endblock=99999999`,
        `&sort=asc&apikey=${this.explorerApiKey}`,
      )
  
      return apiLooper.get(this.explorerName, url, {
        cacheResponse: 30 * 1000 // 30 seconds
      })
        .then((response: IUniversalObj) => {
          const transactions = response.result
            .filter((item) => item.value > 0)
            .map((item) => ({
              confirmations: item.confirmations,
              type: tokenName.toLowerCase(),
              hash: item.hash,
              contractAddress: item.contractAddress,
              status: item.blockHash !== null ? 1 : 0,
              value: new BigNumber(String(item.value)).dividedBy(new BigNumber(10).pow(Number(item.tokenDecimal))).toNumber(),
              address: item.to,
              date: item.timeStamp * 1000,
              direction: address.toLowerCase() === item.to.toLowerCase() ? 'in' : 'out',
            }))
            .filter((item) => {
              if (item.direction === 'in') return true
              if (!this.adminFeeObj) return true
              if (address.toLowerCase() === this.adminFeeObj.address.toLowerCase()) return true
              if (item.address.toLowerCase() === this.adminFeeObj.address.toLowerCase()) return false
  
              return true
            })

          res(transactions)
        })
        .catch((error) => {
          this.reportError(error)
          res([])
        })
    })
  }

  fetchBalance = async (address, contractAddress, decimals) => {
    const ERC20 = new web3.eth.Contract(TokenAbi, contractAddress)
    const result = await ERC20.methods.balanceOf(address).call()
  
    return new BigNumber(String(result))
      .dividedBy(new BigNumber(String(10)).pow(decimals))
      .toNumber()
  }

  fetchTokenTxInfo = (ticker, hash, cacheResponse) => {
    return new Promise(async (res) => {
      let txInfo: IUniversalObj = await this.fetchTxInfo(hash, cacheResponse)
  
      if (txInfo.isContractTx) {
        // This is tx to contract. Fetch all txs and find this tx
        const transactions: IUniversalObj = await this.getTransaction(txInfo.senderAddress, ticker)
        const ourTx = transactions.filter((tx) => tx.hash.toLowerCase() === hash.toLowerCase())

        if (ourTx.length) {
          txInfo.amount = ourTx[0].value
          txInfo.adminFee = false // Swap dont have service fee
  
          if (ourTx[0].direction == `in`) {
            txInfo = {
              ...txInfo,
              receiverAddress: txInfo.senderAddress,
              senderAddress: txInfo.receiverAddress,
            }
          }
        }
      }

      res(txInfo)
    })
  }

  fetchTxInfo = (hash, cacheResponse) => {
    return new Promise((res, rej) => {
      const { user: { tokensData } } = getState()
      const url = `?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${this.explorerApiKey}`
    
      return apiLooper.get(this.explorerName, url, {
        cacheResponse,
      })
        .then((response: any) => {
          if (response && response.result) {
            let amount = 0
            let receiverAddress = response.result.to
            const contractAddress = response.result.to
            let tokenDecimal = 18
    
            for (const key in tokensData) {
              if (
                tokensData[key]
                && tokensData[key].contractAddress?.toLowerCase() == contractAddress.toLowerCase()
                && tokensData[key].decimals
              ) {
                tokenDecimal = tokensData[key].decimals
                break
              }
            }
    
            const txData = Decoder.decodeData(response.result.input)
    
            if (
              txData &&
              txData.inputs?.length === 2 &&
              txData.name === `transfer` || txData.method === `transfer`
            ) {
              receiverAddress = `0x${txData.inputs[0]}`
              amount = new BigNumber(txData.inputs[1]).div(new BigNumber(10).pow(tokenDecimal)).toNumber()
            }

            const {
              from,
              gas,
              gasPrice,
              blockHash,
            } = response.result
    
            const minerFee = new BigNumber(web3.utils.toBN(gas).toNumber())
              .multipliedBy(web3.utils.toBN(gasPrice).toNumber())
              .dividedBy(1e18)
              .toNumber()
    
            let adminFee: number | false = false
    
            if (this.adminFeeObj) {
              const feeFromUsersAmount = new BigNumber(this.adminFeeObj.fee)
                .dividedBy(100)
                .multipliedBy(amount)

              if (new BigNumber(this.adminFeeObj.min).isGreaterThan(feeFromUsersAmount)) {
                adminFee = new BigNumber(this.adminFeeObj.min).toNumber()
              } else {
                adminFee = feeFromUsersAmount.toNumber()
              }
            }
  
            res({
              amount,
              afterBalance: null,
              receiverAddress,
              senderAddress: from,
              minerFee,
              minerFeeCurrency: this.currency,
              adminFee,
              confirmed: blockHash !== null,
              isContractTx: contractAddress.toLowerCase() === externalConfig.swapContract.erc20.toLowerCase(),
            })
    
          } else {
            res(false)
          }
        })
        .catch((error) => {
          this.reportError(error)
          res(false)
        })
    })
  }

  fetchFees = async (params) => {
    const { gasPrice, gasLimit, speed } = params
    const newGasPrice = gasPrice || await helpers[this.currencyKey].estimateGasPrice({ speed })
    const newGasLimit = gasLimit || DEFAULT_CURRENCY_PARAMETERS.ethToken.limit.send
  
    return {
      gas: newGasLimit,
      gasPrice: newGasPrice,
    }
  }

  login = (privateKey, contractAddress, nameContract, decimals, fullName) => {
    let data

    if (privateKey) {
      data = web3.eth.accounts.privateKeyToAccount(privateKey)
    } else {
      data = web3.eth.accounts.create()
      web3.eth.accounts.wallet.add(data)
    }
  
    web3.eth.accounts.wallet.add(data.privateKey)
    this.setupContract(data.address, contractAddress, nameContract, decimals, fullName)
  }

  setupContract = (ethAddress, contractAddress, nameContract, decimals, fullName) => {
    if (!web3.eth.accounts.wallet[ethAddress]) {
      throw new Error('web3 does not have given address')
    }
  
    const isSweeped = actions[this.currencyKey].isSweeped()
  
    let data = {
      address: ethAddress,
      balance: 0,
      name: nameContract.toLowerCase(),
      fullName,
      currency: nameContract.toUpperCase(),
      contractAddress,
      decimals,
      currencyRate: 1,
      isMnemonic: isSweeped,
      isMetamask: false,
      isConnected: false,
      // TODO: use a type key delete this key
      isERC20: true,
      type: this.type,
    }
  
    if (metamask.isEnabled() && metamask.isConnected()) {
      data = {
        ...data,
        address: metamask.getAddress(),
        isMetamask: true,
        isConnected: true,
      }
    }
  
    reducers.user.setTokenAuthData({ name: data.name, data })  
  }

  send = async (params) => {
    const { name, from, to, amount, ...feeConfig } = params
    const { tokenContract, formatWithDecimals } = this.returnTokenInfo(name)
    const feeResult = await this.fetchFees({ ...feeConfig })
    const txArguments = {
      gas: feeResult.gas,
      gasPrice: feeResult.gasPrice,
      from,
    }
  
    const newAmount = formatWithDecimals(amount)

    const walletData = actions.core.getWallet({
      address: from,
      currency: name,
    })
  
    return new Promise(async (res, rej) => {
      const receipt = tokenContract.methods.transfer(to, newAmount).send(txArguments)
        .on('transactionHash', (hash) => res({ transactionHash: hash }))
        .on('error', (error) => {
          this.reportError(error)
          rej(error)
        })

      // Admin fee transaction
      if (this.adminFeeObj && walletData.isMetamask) {
        receipt.then(() => {
          this.sendAdminFee({
            tokenContract,
            amount,
            from,
            gasPrice: txArguments.gas,
            gasLimit: txArguments.gasPrice,
          })
        })
      }
    })
  }

  sendAdminFee = async (params) => {
    const { tokenContract, amount, gasPrice, gasLimit, from } = params
    const { formatWithDecimals } = this.returnTokenInfo(name)
    const minAmount = new BigNumber(this.adminFeeObj.min)
    let feeFromUsersAmount = new BigNumber(this.adminFeeObj.fee)
      .dividedBy(100) // 100 %
      .multipliedBy(amount)
      .toNumber()
    
    if (minAmount.isGreaterThan(feeFromUsersAmount)) {
      feeFromUsersAmount = minAmount.toNumber()
    }

    feeFromUsersAmount = formatWithDecimals(feeFromUsersAmount)

    const txArguments = {
      gasPrice,
      gas: gasLimit,
      from,
    }

    return new Promise(async (res) => {
      await tokenContract.methods.transfer(this.adminFeeObj.address, feeFromUsersAmount).send(txArguments)
        .on('transactionHash', (hash) => {
          console.group('%c Admin commission is sended', 'color: green;')
          console.log('type', this.type)
          console.log('tx hash', hash)
          console.groupEnd()
          res(hash)
        })
    })
  }

  approve = async (params) => {
    const { name, to, amount } = params
    const { tokenContract, formatWithDecimals } = this.returnTokenInfo(name)
    const feeResult = await this.fetchFees({ speed: 'fast' })
    const weiAmount = formatWithDecimals(amount)
  
    return new Promise(async (res, rej) => {
      const receipt = await tokenContract.methods.approve(to, weiAmount).send(feeResult)
        .on('transactionHash', (hash) => {
          console.group('Actions >%c approve the token', 'color: green')
          console.log(`type: ${this.type}; name: ${name}`)
          console.log('tx hash: ', hash)
          console.groupEnd()
        })
        .catch((error) => {
          this.reportError(error)
          rej(error)
        })
  
      res(receipt.transactionHash)
    })
  }

  setAllowance = async (params) => {
    let { name, to, targetAllowance } = params
    name = name.toLowerCase()

    const { formatWithDecimals, decimals } = this.returnTokenInfo(name)
    const ownerAddress = getState().user.tokensData[name].address
    const allowance = await erc20tokens.checkAllowance({
      tokenOwnerAddress: ownerAddress,
      tokenContractAddress: to,
      decimals: decimals,
    })
  
    // if contract has enough allowance then skip
    if (new BigNumber(formatWithDecimals(targetAllowance)).isLessThanOrEqualTo(allowance)) {
      return Promise.resolve()
    }

    return this.approve({ name, to, amount: targetAllowance })
  }

  returnTokenInfo = (name) => {
    if (!name) throw new Error(`${this.type} actions; returnTokenInfo(name): name is undefined`)
  
    name = name.toLowerCase()
  
    const ownerAddress = getState().user.tokensData[name].address
    const {
      [name]: {
        address: contractAddress,
        decimals,
      },
    } = externalConfig.erc20
    const tokenContract = new web3.eth.Contract(TokenAbi, contractAddress, { from: ownerAddress })
    const formatWithDecimals = (amount) => {
      return new BigNumber(amount)
        .times(new BigNumber(10)
        .pow(decimals))
        .toNumber()
    }
    const formatWithoutDecimals = (wei) => {
      return new BigNumber(wei)
        .div(new BigNumber(10)
        .pow(decimals))
        .toNumber()
    }
  
    return {
      contractAddress,
      tokenContract,
      decimals,
      formatWithDecimals,
      formatWithoutDecimals,
    }
  }
}

// Temporarily
const TokenInstance = externalConfig.binance
  ? (
    new Erc20LikeAction({
      currency: 'BNB',
      type: 'BEP20',
      explorerName: 'bscscan',
      explorerLink: externalConfig.link.bscscan,
      explorerApiKey: externalConfig.api.bscscan_ApiKey,
      adminFeeObj: externalConfig.opts?.fee?.erc20,
    })
  ) : (
    new Erc20LikeAction({
      currency: 'ETH',
      type: 'ERC20',
      explorerName: 'etherscan',
      explorerLink: externalConfig.link.etherscan,
      explorerApiKey: externalConfig.api.etherscan_ApiKey,
      adminFeeObj: externalConfig.opts?.fee?.erc20,
    })
  )

export default {
  // TODO: integrate with BNB and replace with keys: bep20, erc20
  token: TokenInstance,
}