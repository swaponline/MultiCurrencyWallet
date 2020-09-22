const bitcoin = require('bitcoinjs-lib')
//const request = require('request-promise-native')
const request = require('../helpers/request')
const BigNumber = require('bignumber.js')
const debug = require('debug')

const BITPAY = `https://test-insight.bitpay.com/api`
const BITPAY_MAIN = `https://insight.bitpay.com/api`

const BLOCKCYPHER_API = `https://api.blockcypher.com/v1/btc/main/`
const BLOCKCYPHER_API_TESTNET = `https://api.blockcypher.com/v1/btc/test3/`
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

  constructor(_network) {
    this.core = bitcoin

    this.net = bitcoin.networks[_network === 'mainnet' ? 'bitcoin' : 'testnet']
    this.network = _network
    this.root = this.network === 'testnet' ? BITPAY : BITPAY_MAIN
  }

  getRate() {
    // 10 min cache
    request.get('https://noxonfund.com/curs.php', { cacheResponse: 10*60*1000 } )
      .then(({ price_btc }) => {
        return price_btc
      })
      .catch(err => console.error(`NOXONFUND error: ${err.message}`))
  }

  async calculateTxSize({ speed, unspents, address, txOut = 2 } = {}) {
    unspents = unspents || await this.fetchUnspents(address)

    const txIn = unspents.length

    const txSize = txIn > 0
      ? txIn * 146 + txOut * 33 + (15 + txIn - txOut)
      : 226 // default tx size for 1 txIn and 2 txOut

    return txSize
  }

  async estimateFeeValue({ feeRate, inSatoshis, speed, address, txSize } = {}) {
    const DUST = 546
    let calculatedFeeValue

    if (!txSize && !address) {
      debug('swap.core:bitcoin')('estimateFeeValue: need address or txSize')
      calculatedFeeValue = BigNumber(DUST).multipliedBy(1e-8)
    } else {
      txSize = txSize || await this.calculateTxSize({ address, speed })
      feeRate = feeRate || await this.estimateFeeRate({ speed })

      calculatedFeeValue = BigNumber.maximum(
        DUST,
        BigNumber(feeRate)
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
        queryResponse: true,
        cacheOnFail: true,
      } )
      .then(json => JSON.parse(json))
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
        queryResponse: true,
        cacheOnFail: true,
      } )
      .then(json => JSON.parse(json))
      .then(info => Number(info[_speed]))
      .catch(error => filterError(error))
  }

  fetchBalance(address) {
    // 10 seconds cache
    // query requests
    return request.get(`${this.root}/addr/${address}`,
      {
        cacheResponse: 10*1000,
        queryResponse: true,
      }
    ).then(( json ) => {
      const balance = JSON.parse(json).balance
      debug('swap.core:bitcoin')('BTC Balance:', balance)

      return balance
    })
    .catch(error => filterError(error))
  }

  fetchUnspents(address) {
    // 10 seconds cache
    // query requests
    return request.get(`${this.root}/addr/${address}/utxo`,
      {
        cacheResponse: 10*1000,
        queryResponse: true,
      }
    ).then(json => JSON.parse(json))
    .catch(error => filterError(error))
  }

  broadcastTx(txRaw) {
    return request.post(`${this.root}/tx/send`, {
      json: true,
      body: {
        rawtx: txRaw,
      },
    })
    .catch(error => filterError(error))
  }

  fetchTx(hash) {
    // 10 seconds cache
    // query request
    return request
      .get(`${this.root}/tx/${hash}`, {
        cacheResponse: 10*1000,
        queryResponse: true,
      } )
      .then(json => JSON.parse(json))
      .then(({ fees, ...rest }) => ({
        fees: BigNumber(fees).multipliedBy(1e8),
        ...rest,
      }))
      .catch(error => {
        debug('swap.core:bitcoin')('BitPay:', error)
        return {}
      })
  }

  fetchTxInfo(hash) {
    return this.fetchTx(hash)
      .then(({ vin, ...rest }) => ({
        senderAddress: vin[0].addr,
        ...rest,
      }))
      .catch((error) => error)
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
      .then(response => {
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

        const usdsatoshis = BigNumber(findById[0].value)

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
    const url = `/txs/?address=${scriptAddress}`

    return request.get(`${this.root}${url}`)
      .then(json => JSON.parse(json))
      .then((res) => {
        if (res.txs.length > 1
          && res.txs[0].vout.length
        ) {
          const address = res.txs[0].vout[0].scriptPubKey.addresses[0]
          const {
            txid,
            valueOut: amount,
          } = res.txs[0]
          return {
            address,
            txid,
            amount,
          }
        }
        return false
      })
  }

  async sendTransaction({ account, to, value }, handleTransactionHash) {
    const tx = new bitcoin.TransactionBuilder(this.net)

    value = BigNumber(value)

    const unspents      = await this.fetchUnspents(account.getAddress())

    const fundValue     = value.multipliedBy(1e8).integerValue().toNumber()
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

module.exports = new Bitcoin()
module.exports.mainnet = () => new Bitcoin('mainnet')
module.exports.testnet = () => new Bitcoin('testnet')
