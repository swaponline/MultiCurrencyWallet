import * as bitcoin from 'bitcoinjs-lib'
import request from '../helpers/request'
import bitcoinUtils from '../../../../common/utils/bitcoin'
import BigNumber from 'bignumber.js'
import debug from 'debug'

const BITPAY = `https://api.bitcore.io/api/BTC/testnet`
const BITPAY_MAIN = `https://api.bitcore.io/api/BTC/mainnet`

const BLOCKCYPHER_API = `https://api.blockcypher.com/v1/btc/main`
const BLOCKCYPHER_API_TESTNET = `https://api.blockcypher.com/v1/btc/test3`
const EARN_COM = `https://bitcoinfees.earn.com/api/v1/fees/recommended`
// const BLOCKCYPHER_API_TOKEN = process.env.BLOCKCYPHER_API_TOKEN




const filterError = (error) => {
  const { name, code, statusCode, options } = error

  if (name == 'StatusCodeError' && statusCode == 525)
    debug('swap.core:bitcoin')('Error:', `BITPAY refuse:`, options.method, options.uri)
  else
    debug('swap.core:bitcoin')(`UnknownError: statusCode=${statusCode} ${error.message}`)

  throw error
}

class Bitcoin {
  core: any
  net: any
  network: any
  root: any
  API_BITPAY: any
  API_BLOCKCYPHER: any

  constructor(_network?) {
    this.core = bitcoin

    this.net = bitcoin.networks[_network === 'mainnet' ? 'bitcoin' : 'testnet']
    this.network = _network
    this.root = this.network === 'testnet' ? BITPAY : BITPAY_MAIN
    this.API_BITPAY = {
      name: 'bitpay',
      servers: this.network === 'testnet' ? BITPAY : BITPAY_MAIN,
    }

    this.API_BLOCKCYPHER = {
      name: 'blocyper',
      servers: this.network === 'testnet' ? BLOCKCYPHER_API_TESTNET : BLOCKCYPHER_API,
    }
  }

  getRate() {
    // 10 min cache
    request.get('https://noxonfund.com/curs.php', { cacheResponse: 10*60*1000 } )
      .then(({ price_btc }) => {
        return price_btc
      })
      .catch(err => console.error(`NOXONFUND error: ${err.message}`))
  }

  async calculateTxSize({ speed, unspents = null, address, txOut = 2 }) {
    unspents = unspents || await this.fetchUnspents(address)

    const txIn = unspents.length

    const txSize = txIn > 0
      ? txIn * 146 + txOut * 33 + (15 + txIn - txOut)
      : 226 // default tx size for 1 txIn and 2 txOut

    return txSize
  }

  async estimateFeeValue(options: {
      feeRate?: number,
      inSatoshis: boolean,
      speed: string,
      address: string,
      txSize: number,
    }) {
    let { feeRate, inSatoshis, speed, address, txSize } = options
    let calculatedFeeValue
    const DUST = 546

    if (!txSize && !address) {
      debug('swap.core:bitcoin')('estimateFeeValue: need address or txSize')
      calculatedFeeValue = new BigNumber(DUST).multipliedBy(1e-8)
    } else {
      txSize = txSize || await this.calculateTxSize({ address, speed })
      feeRate = feeRate || await this.estimateFeeRate({ speed })

      calculatedFeeValue = BigNumber.maximum(
        DUST,
        new BigNumber(feeRate)
          .multipliedBy(txSize)
          .div(1024)
          .dp(0, BigNumber.ROUND_HALF_EVEN),
      )
    }

    const finalFeeValue = inSatoshis
      ? calculatedFeeValue.toString()
      : calculatedFeeValue.multipliedBy(1e-8).toString()

    return finalFeeValue
  }

  async estimateFeeRate(options) {
    try {
      return await this.estimateFeeRateBLOCKCYPHER(options)
    } catch (err) {
      console.error(`EstimateFeeError: BLOCKCYPHER_API ${err.message}, trying EARN.COM...`)
      return await this.estimateFeeRateEARNCOM(options)
    }
  }

  estimateFeeRateEARNCOM({ speed = 'fast' } = {}) {
    const _speed = (() => {
      switch (speed) {
        case 'fast':    return 'fastestFee'
        case 'normal':  return 'halfHourFee'
        case 'slow':    return 'hourFee'
        default:      return 'halfHourFee'
      }
    })()

    // 10 minuts cache
    // query request
    // use cache if fail
    return request
      .get(`${EARN_COM}`, {
        cacheResponse: 10*60*1000,
        cacheOnFail: true,
        inQuery: {
          delay: 500,
          name: `blocyper`,
        },
      } )
      .then((json: any) => JSON.parse(json))
      .then(fees => Number(fees[_speed]) * 1024)
      .catch(error => filterError(error))
  }

  estimateFeeRateBLOCKCYPHER({ speed = 'fast' } = {}) {
    const _speed = (() => {
      switch (speed) {
        case 'fast':    return 'high_fee_per_kb'
        case 'normal':  return 'medium_fee_per_kb'
        case 'slow':    return 'low_fee_per_kb'
        default:      return 'medium_fee_per_kb'
      }
    })()

    const API_ROOT = this.network === 'testnet'
      ? BLOCKCYPHER_API_TESTNET
      : BLOCKCYPHER_API

    // 10 minuts cache
    // query request
    return request
      .get(`${API_ROOT}`, {
        cacheResponse: 10*60*1000,
        cacheOnFail: true,
        inQuery: {
          delay: 500,
          name: `blocyper`,
        },
      } )
      .then((json: string) => JSON.parse(json))
      .then(info => Number(info[_speed]))
      .catch(error => filterError(error))
  }

  fetchBalance(address) {
    return bitcoinUtils.fetchBalance(address, false, this.API_BITPAY, 10*1000)
  }

  fetchUnspents(address) {
    return bitcoinUtils.fetchUnspents(address, this.API_BITPAY, 10*1000)
  }

  broadcastTx(txRaw) {
    return bitcoinUtils.broadcastTx(txRaw, this.API_BITPAY, this.API_BLOCKCYPHER)
  }

  fetchTx(hash) {
    return bitcoinUtils.fetchTx(hash, this.API_BITPAY, 10*1000)
  }

  fetchTxInfo(hash) {
    return bitcoinUtils.fetchTxInfo(hash, this.API_BITPAY, 10*1000)
  }

  fetchOmniBalance(address, assetId = 31) {
    return request.post(`https://api.omniexplorer.info/v1/address/addr/`, {
        json: true,
        form: {
          addr: address,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then((response: any) => {
        const { error, balance } = response

        if (error) throw new Error(`Omni Balance: ${error}`)

        const findById = balance
          .filter(asset => parseInt(asset.id) === assetId || asset.id === assetId)

        if (!findById.length) {
          return 0
        }

        debug('swap.core:bitcoin')('Omni Balance:', findById[0].value)
        debug('swap.core:bitcoin')('Omni Balance pending:', findById[0].pendingpos)
        debug('swap.core:bitcoin')('Omni Balance pending:', findById[0].pendingneg)

        const usdsatoshis = new BigNumber(findById[0].value)

        if (usdsatoshis) {
          return usdsatoshis.dividedBy(1e8).toNumber()
        } else {
          return 0
        }
      })
      .catch(error => filterError(error))
  }

  /*
    Проверяет списание со скрипта - последняя транзакция выхода
    Возвращает txId, адресс и сумму
  */
  checkWithdraw = (scriptAddress) => {
    return bitcoinUtils.checkWithdraw(scriptAddress, this.API_BITPAY)
  }

  async sendTransaction({ account, to, value }, handleTransactionHash) {
    const tx: any = new bitcoin.TransactionBuilder(this.net)

    const unspents: any = await this.fetchUnspents(account.getAddress())

    const fundValue     = new BigNumber(value).multipliedBy(1e8).integerValue().toNumber()
    const feeValue      = 1000
    const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
    const skipValue     = totalUnspent - fundValue - feeValue

    if (totalUnspent < feeValue + fundValue) {
      throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
    }

    unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe))
    tx.addOutput(to, fundValue)

    if (skipValue)
      tx.addOutput(account.getAddress(), skipValue)

    tx.inputs.forEach((input, index) => {
      tx.sign(index, account)
    })

    const txRaw = tx.buildIncomplete()

    if (typeof handleTransactionHash === 'function') {
      handleTransactionHash(txRaw.getId())
      debug('swap.core:bitcoin')('tx id', txRaw.getId())
    }

    debug('swap.core:bitcoin')('raw tx = ', txRaw.toHex())

    const result = await this.broadcastTx(txRaw.toHex())

    return result
  }
}

const mainnet = () => new Bitcoin('mainnet')
const testnet = () => new Bitcoin('testnet')

const networks = {
  mainnet,
  testnet
}

export {
  networks,
  mainnet,
  testnet,
}
