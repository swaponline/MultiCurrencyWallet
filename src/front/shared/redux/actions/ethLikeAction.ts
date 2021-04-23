import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'
import helpers, { web3, getWeb3 } from 'helpers/web3'
import actions from 'redux/actions'

class EthLikeAction {
  private ticker: string
  private precision: number
  private gasApi: string

  constructor(options) {
    const {
      ticker,
      precision,
      address,
      gasApi,
      // ? ...
    } = options

    this.ticker = ticker
    this.precision = precision
    this.gasApi = gasApi
  }

  // sendWithAdminFee, sendDefault
  // TODO: return type
  send = async (params): Promise<any> => {
    let { from, to, amount, gasPrice, gasLimit, speed } = params
    const web3js = await getWeb3()
    const recipientIsContract = await addressIsContract(to)
  
    gasPrice = gasPrice || await helpers[
      this.ticker.toLowerCase()
    ].estimateGasPrice({ speed })

    gasLimit = gasLimit || (
      recipientIsContract
        // ? will use eth for all BC
        ? DEFAULT_CURRENCY_PARAMETERS.eth.limit.contractInteract
        : DEFAULT_CURRENCY_PARAMETERS.eth.limit.send
    )
  
    const txObject = {
      from,
      to: to.trim(),
      gasPrice,
      gas: gasLimit,
      value: web3.utils.toWei(String(amount)),
    }
    const walletData = actions.core.getWallet({
      address: from,
      currency: this.ticker,
    })
    // const privateKey = !walletData.isMetamask
    //   ? getPrivateKeyByAddress(from)
    //   : false
  
    return new Promise((res, rej) => {
      // 
    })
  }

  /* 
    send
    login
    getBalance
    fetchBalance
    getTransaction
    getInvoices
    getTx
    getLinkToInfo
    getWalletByWords
    sweepToMnemonic
    isSweeped
    getSweepAddress
    getAllMyAddresses
    fetchTxInfo
    sendTransaction
    getTxRouter
    addressIsContract
  */
}

// ? move it into common
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

export default {
  ETH: new EthLikeAction({
    ticker: 'ETH',
  }),
  BNB: new EthLikeAction({
    ticker: 'BNB'
  }),
}