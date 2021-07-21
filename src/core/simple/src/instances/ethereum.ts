import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import debug from 'debug'

import request from '../helpers/request'


// const MAINNET_PROVIDER = `https://mainnet.infura.io/JCnK5ifEPH9qcQkX0Ahl`
const TESTNET_PROVIDER = `https://rinkeby.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c`

const MAINNET_PROVIDER = process.env.WEB3_MAINNET_PROVIDER || `https://geth.swaponline.site`
const LOCAL_PROVIDER = process.env.WEB3_LOCAL_PROVIDER || `http://localhost:7545`

const WEB3_PROVIDERS = {
  mainnet: new Web3.providers.HttpProvider(MAINNET_PROVIDER),
  testnet: new Web3.providers.HttpProvider(TESTNET_PROVIDER),
}

const ETHERCHAIN_API = `https://www.etherchain.org/api/gasPriceOracle`
const ETHGASSTATION_API = `https://ethgasstation.info/json/ethgasAPI.json`

const ETHERSCAN_APIKEY = `87F9B9IH33JPVRM5ZVFEK1DQTM64FUZFMV`

const filterError = (error) => {
  const { name, code, statusCode, options } = error

  debug('swap.core:ethereum')(`UnknownError: statusCode=${statusCode} ${error.message}`)

  throw error
}

class Ethereum {

  core: any
  etherscan: any

  constructor(_network = 'testnet') {
    const _provider = WEB3_PROVIDERS[_network]
    //@ts-ignore
    if (typeof web3 !== 'undefined') {
      //@ts-ignore
      this.core = new Web3(web3.currentProvider)
    } else {
      this.core = new Web3(_provider)
    }

    this.etherscan = _network === 'testnet'
      ? `https://api-rinkeby.etherscan.io`
      : `https://api.etherscan.io`
  }

  fetchBalance(address) {
    return this.core.eth.getBalance(address)
      .then((wei) => {
        let balance = this.core.utils.fromWei(wei)

        debug('swap.core:ethereum')('ETH Balance:', balance)

        return balance
      })
      .catch((error) => {
        debug('swap.core:ethereum')('ETH error:', error)

        return '0'
      })
  }

  fetchTokenBalance(address, tokenAddress, decimals) {
    const TEN = new BigNumber(10)
    const base = TEN.pow(decimals) // 1e18 usually
    const url = `${this.etherscan}/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${address}&apikey=${ETHERSCAN_APIKEY}`

    // cache 10 seconds
    // query request
    return request
      .get(url, {
        cacheResponse: 10*1000,
        queryResponse: true,
      })
      .then((json: any) => JSON.parse(json))
      .then(({ result }) => result)
      .then(raw => new BigNumber(raw).dividedBy(base).toString())
      .catch(error => {
        debug('swap.core:ethereum')(`TokenBalanceError: ${error.statusCode} ${url} - Failed to fetch token balance (${tokenAddress}). Probably too frequent request!`)

        return '0'
      })
  }

  async sendTransaction({ to, amount }) {
    const from = this.core.eth.accounts.wallet[0]
    const gas = 1e5

    amount = this.core.utils.toWei(amount.toString())

    return this.core.eth.sendTransaction({ from, to, amount, gas })
  }

  async estimateGasPrice(options) {
    try {
      return await this.estimateGasPriceEtherChain(options)
    } catch (etherChainError) {
      console.error('EstimateFeeError: EtherChain, falling back to EthGasStation estimation...')
    }

    try {
      return await this.estimateGasPriceEthGasStation(options)
    } catch(ethGasStationError) {
      console.error('EstimateFeeError: EthGasStation, falling back to Web3 estimation...')
    }

    return await this.estimateGasPriceWeb3(options)
  }

  async estimateGasPriceWeb3({ speed = 'fast' } = {}) {
    const _multiplier = (() => {
      switch (speed) {
        case 'fast':    return 2
        case 'normal':  return 1
        case 'slow':    return 0.5
        default:      return 1
      }
    })()

    const gasPrice = await new Promise((resolve, reject) =>
      this.core.eth.getGasPrice((err, gasPrice) => {
        if (err) {
          reject(err)
        } else {
          resolve(gasPrice)
        }
      })
    )
    //@ts-ignore
    return new BigNumber(gasPrice).multipliedBy(_multiplier)
  }

  estimateGasPriceEtherChain({ speed = 'fast' } = {}) {
    const _speed = (() => {
      switch (speed) {
        case 'fast':    return 'fast'
        case 'normal':  return 'standard'
        case 'slow':    return 'safeLow'
        default:      return 'standard'
      }
    })()

    // cache 10 minute
    // query request
    // use cache if fail
    return request
      .get(`${ETHERCHAIN_API}`, {
        cacheResponse: 10 * 60 * 1000,
        queryResponse: true,
        cacheOnFail: true,
      })
      .then((json: string) => JSON.parse(json))
      .then(fees => new BigNumber(fees[_speed]).multipliedBy(1e9))
      .catch(error => filterError(error))
  }

  estimateGasPriceEthGasStation({ speed = 'fast' }) {
    const _speed = (() => {
      switch (speed) {
        case 'fast':    return 'fast'
        case 'normal':  return 'average'
        case 'slow':    return 'safeLow'
        default:      return 'average'
      }
    })()

    // cache 10 minute
    // query request
    // use cache if fail
    return request
      .get(`${ETHGASSTATION_API}`, {
        cacheResponse: 10 * 60 * 1000,
        queryResponse: true,
        cacheOnFail: true,
      })
      .then((json: any) => JSON.parse(json))
      .then(fees => new BigNumber(fees[_speed]).dividedBy(10).multipliedBy(1e9))
      .catch(error => filterError(error))
  }
}

const mainnet = () => new Ethereum('mainnet')
const testnet = () => new Ethereum('testnet')

const networks = {
  mainnet,
  testnet
}

export {
  networks,
  mainnet,
  testnet
}
