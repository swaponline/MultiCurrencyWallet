import apiLooper from '../apiLooper'
import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import typeforce from 'swap.app/util/typeforce'

// Use front API config
import { default as TESTNET } from '../../../front/config/testnet/api'
import { default as MAINNET } from '../../../front/config/mainnet/api'

const DUST = 546

const getBitpay = (network) => {
  return {
    name: `apiBitpay`,
    servers: (network === `MAINNET`)
      ? MAINNET.bitpay
      : TESTNET.bitpay
  }
}

const getCore = () => {
  return bitcoin
}


const getBlockcypher = (network) => {
  return {
    name: `apiBlockcypher`,
    servers: (network === `MAINNET`)
      ? MAINNET.blockcypher
      : TESTNET.blockcypher
  }
}

const fetchBalance = (options) => {
  const {
    address,
    withUnconfirmed,
    apiBitpay,
    cacheResponse,
    NETWORK,
  } = options

  return apiLooper.get(apiBitpay || getBitpay(NETWORK), `/address/${address}/balance/`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    inQuery: {
      delay: 500,
      name: `bitpay`,
    },
  }).then((answer: any) => {
    const {
      balance,
      unconfirmed,
    } = answer
    if (withUnconfirmed) {
      return {
        balance: new BigNumber(balance).dividedBy(1e8).toNumber(),
        unconfirmed: new BigNumber(unconfirmed).dividedBy(1e8).toNumber(),
      }
    } else {
      return new BigNumber(balance).dividedBy(1e8).toNumber()
    }
  })
}

const fetchTx = (options) => {
  const {
    hash,
    apiBitpay,
    cacheResponse,
    NETWORK,
  } = options

  return apiLooper.get(apiBitpay || getBitpay(NETWORK), `/tx/${hash}`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.fee !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    inQuery: {
      delay: 500,
      name: `bitpay`,
    },
  }).then(({ fee, ...rest }) => ({
      fees: new BigNumber(fee).dividedBy(1e8).toNumber(),
      ...rest,
    }
  ))
}


// @ToDo - Make interface - fetchTxInfo общая для всех блокчейнов - она возврашет сведенные данные определенного типа
const fetchTxInfo = (options) : any => {
  const {
    hash,
    apiBitpay,
    cacheResponse,
    hasAdminFee,
    NETWORK,
  } = options

  return new Promise(async (callback, txinfoReject) => {
    let baseTxInfo: any | boolean = false // @ToDo - make interface for baseTxInfo api answer
    let txCoins: any | boolean = false // @ToDo - make interface for txCoins api answer

    try {
      baseTxInfo = await fetchTx({
        hash,
        apiBitpay,
        cacheResponse,
        NETWORK,
      })
    } catch (error) {
      console.error('Fail fetch tx info', error)
      txinfoReject(error)
      return
    }
    try {
      txCoins = await apiLooper.get(apiBitpay || getBitpay(NETWORK), `/tx/${hash}/coins`, {
        cacheResponse,
        /* checkStatus */
        inQuery: {
          delay: 500,
          name: `bitpay`,
        },
      })
    } catch (error) {
      console.error('Failt fetch tx coin info', error)
      txinfoReject(error)
    }

    let receiverAddress = null
    let afterBalance = txCoins && txCoins.inputs && txCoins.inputs[1] 
      ? new BigNumber(txCoins.inputs[1].value).dividedBy(1e8).toNumber() 
      : null
    let adminOutput = []
    let adminFee : number | boolean = false
    let afterOutput = []

    if (!txCoins || !txCoins.inputs || !txCoins.outputs) {
      console.error('tx coin info empty')
      txinfoReject('tx coin info empty')
    }

    const senderAddress = txCoins && txCoins.inputs ? txCoins.inputs[0].address : null
    const amount = new BigNumber(txCoins.outputs[0].value).dividedBy(1e8).toNumber()

    if (hasAdminFee) {
      adminOutput = txCoins.outputs.filter((out) => {
        return (
          out.address === hasAdminFee.address
          && !(new BigNumber(out.value).eq(amount))
        )
      })
    }


    /*
    // @ToDo - need fix
    if (txCoins && txCoins.outputs) {
      afterOutput = txCoins.outputs.filter(({ address }) => {
        return (
          address !== hasAdminFee.address
        )
      })
    }
    */

    if (afterOutput.length) {
      afterBalance = new BigNumber(afterOutput[0].value).dividedBy(1e8).toNumber()
    }

    if (adminOutput.length) {
      adminFee = new BigNumber(adminOutput[0].value).dividedBy(1e8).toNumber()
    }

    
    if (txCoins && txCoins.outputs && txCoins.outputs[0]) {
      receiverAddress = txCoins.outputs[0].address
    }

    // @ToDo - Интерфейс этой функции
    const txInfo = {
      txid: baseTxInfo.txid,
      amount,
      afterBalance,
      senderAddress,
      confirmed: !!(baseTxInfo.confirmations),
      confirmations: baseTxInfo.confirmations,
      receiverAddress,
      
      minerFee: baseTxInfo.fees,
      adminFee,
      minerFeeCurrency: 'BTC',

      outputs: txCoins.outputs.map((output) => ({
        ...output,
        amount: new BigNumber(output.value).dividedBy(1e8).toNumber(),
      })),
      inputs: txCoins.inputs.map((input) => ({
        ...input,
        amount: new BigNumber(input.value).dividedBy(1e8).toNumber(),
      })),
      fees: baseTxInfo.fees,
      size: baseTxInfo.size,
    }

    callback( txInfo )
  })
}

export interface IBtcUnspent {
  address: string,
  amount: number,
  confirmations: number,
  height: number,
  satoshis: number,
  scriptPubKey: string,
  txid: string,
  vout: number,
  spentTxid: string,
}
// @To-do - make interface - ответ этой функции общий для все блокчейнов
const fetchUnspents = (options): Promise<IBtcUnspent[]> => {
  const {
    address,
    apiBitpay,
    cacheResponse,
    NETWORK,
  } = options

  return new Promise((resolve, reject) => {
    apiLooper.get(
      apiBitpay || getBitpay(NETWORK),
      `/address/${address}?unspent=true`,
      {
        cacheResponse: (cacheResponse || 5000),
        inQuery: {
          delay: 500,
          name: `bitpay`,
        },
      }
    ).then((answer: any) => {
      resolve(answer.map((txInfo, index) => {
        return {
          address,
          amount: new BigNumber(txInfo.value).dividedBy(1e8).toNumber(),
          confirmations: txInfo.confirmations,
          height: txInfo.mintHeight,
          satoshis: txInfo.value,
          scriptPubKey: txInfo.script,
          txid: txInfo.mintTxid,
          vout: txInfo.mintIndex,
          spentTxid: txInfo.spentTxid,
        }
      }))
    }).catch((error) => {
      console.error('btc fetchUnspents error', error)
      reject(error)
    })
  })
}

/**
 * Подберает подходящие unspents для указанной суммы в сатоши
 **/
interface IprepareUnspents {
  NETWORK: any,
  address: string,
  amount: number,
  apiBitpay?: any,
  cacheResponse?: any,
}
const prepareUnspents = (options: IprepareUnspents): Promise<IBtcUnspent[]> => {
  const {
    NETWORK,
    apiBitpay,
    cacheResponse,
    address,
    amount,
  } = options
  return new Promise((resolve, reject) => {
    fetchUnspents({
      NETWORK,
      address,
      apiBitpay,
      cacheResponse,
    }).then((unspents: IBtcUnspent[]) => {
      // Сначала отсортируем unspents по возрастанию не потраченной сдачи
      console.log('unspents', unspents)
      const sortedUnspents: IBtcUnspent[] = unspents.sort((a: IBtcUnspent, b: IBtcUnspent) => {
        return (new BigNumber(a.satoshis).isEqualTo(b.satoshis))
          ? 0
          : (new BigNumber(a.satoshis).isGreaterThan(b.satoshis))
            ? 1
            : -1
      })
      console.log('sortedUnspents', sortedUnspents)
      // Подберем здачу, суммы которой хватает для транзакции (от меньшего к большему)
      let calcedAmount = new BigNumber(0)
      const usedUnspents: IBtcUnspent[] = sortedUnspents.filter((unspent: IBtcUnspent) => {
        if (calcedAmount.isGreaterThanOrEqualTo(amount)) {
          return false
        } else {
          calcedAmount = calcedAmount.plus(unspent.satoshis)
          return true
        }
      })
      console.log('usedUnspents', usedUnspents)
      // Попробуем найти один выход сдачи, который покроет транзакцию
      let oneUnspent: IBtcUnspent = null
      sortedUnspents.forEach((unspent: IBtcUnspent) => {
        if (oneUnspent === null
          && new BigNumber(unspent.satoshis).isGreaterThanOrEqualTo(amount)
        ) {
          oneUnspent = unspent
          return false
        }
      })
      console.log('one unspent', oneUnspent)
      // Если один выход не нашли - используем подсчитанные usedUnspents
      
    }).catch((error) => {
      reject(error)
    })
  })
}

// @ToDo - интерфейс - возврашет объект { txid }
const broadcastTx = (options): any => {
  const {
    txRaw,
    apiBitpay,
    apiBlocyper,
    onBroadcastError,
    NETWORK,
  } = options

  return new Promise(async (resolve, reject) => {
    let answer : any | boolean = false // @ToDo - make interface for api answer 
    try {
      answer = await apiLooper.post(apiBitpay || getBitpay(NETWORK), `/tx/send`, {
        body: {
          rawTx: txRaw,
        },
        reportErrors: (error) => {
          console.log('BitPay broadcastTx error', error)
          return true
        },
        inQuery: {
          delay: 500,
          name: `bitpay`,
        },
      })
    } catch (bitpayError) {
      console.log('BitPay broadcastTx error', bitpayError)
      if (onBroadcastError instanceof Function) {
        if (onBroadcastError(bitpayError)) reject()
      }
    }
    if (answer && answer.txid) {
      resolve({ txid: answer.txid })
      return
    }
    if (!answer || !answer.txid) {
      // use blockcryper
      try {
        const bcAnswer : any | boolean = await apiLooper.post(apiBlocyper || getBlockcypher(NETWORK), `/txs/push`, {
          body: {
            tx: txRaw,
          },
          reportErrors: (error) => {
            if (error
              && error.res
              && error.res.res
              && error.res.res.statusMessage
              && error.res.res.statusMessage === `Conflict`
            ) {
              reject('Conflict')
              return false
            }
            return true
          },
          inQuery: {
            delay: 500,
            name: `blocyper`,
          },
        })
        if (bcAnswer
          && bcAnswer.tx
          && bcAnswer.tx.hash) {
          resolve({
            txid: bcAnswer.tx.hash,
          })
        } else {
          reject()
        }
      } catch (blocyperError) {
        console.log('Blocyper broadcastTx error', blocyperError)
        if (onBroadcastError instanceof Function) {
          if (onBroadcastError(blocyperError)) reject()
        }
      }
    }
  })
}

/*
  Проверяет списание со скрипта - последняя транзакция выхода
  Возвращает txId, адресс и сумму
*/
const checkWithdraw = (options) => {
  const {
    scriptAddress,
    apiBitpay,
    NETWORK,
  } = options

  const url = `/address/${scriptAddress}/txs/`

  return apiLooper.get(apiBitpay || getBitpay(NETWORK), url, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.length !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    inQuery: {
      delay: 500,
      name: `bitpay`,
    },
  }).then(async (txs: any) => {
    if ((txs.length > 0)
      && txs[0].mintTxid
      && txs[0].spentTxid
    ) {
      try {
        const spendTxInfo = await fetchTxInfo({
          hash: txs[0].spentTxid,
          apiBitpay
        })
        return {
          address: spendTxInfo.receiverAddress,
          txid: txs[0].spentTxid,
          amount: new BigNumber(txs[0].value).dividedBy(1e8).toNumber(),
        }
      } catch (e) {
        console.error('Fail check Withdraw for ', scriptAddress, e)
      }
    }
    return false
  })
}

const fetchTxRaw = (options) => {
  const {
    txId,
    cacheResponse,
    apiBlocyper,
    NETWORK,
  } = options

  return apiLooper.get(apiBlocyper || getBlockcypher(NETWORK), `/txs/${txId}?includeHex=true`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.hex !== undefined) return true
      } catch (e) {}
      return false
    },
    inQuery: {
      delay: 500,
      name: `blocyper`,
    },
  }).then(({ hex }) => hex)
}


const getTransactionBlocyper = (options) => {
  const {
    address,
    ownAddress,
    ownType,
    myWallets,
    network,
    apiBlocyper,
    NETWORK,
  } = options

  return new Promise((resolve) => {
    const type = (ownType) || 'btc'

    const checkAddress = (address || ownAddress)
    const url = `/addrs/${checkAddress}/full?txlimit=1000000`

    apiLooper.get(
      apiBlocyper || getBlockcypher(NETWORK),
      url,
      {
        cacheResponse: 10*1000,
        inQuery: {
          delay: 500,
          name: `blocyper`,
        },
      }
    ).then((answer: any) => {
      if (answer
        && answer.txs
      ) {
        const transactions = answer.txs.map((item) => {
          const hasOurInputs = item.inputs.filter((input) => {
            return (input.addresses[0] === checkAddress)
          })
          const direction = hasOurInputs.length ? `out` : `in`

          const isSelf = direction === 'out'
            && item.outputs.filter((output) => {
                const currentAddress = output.addresses[0]

                return currentAddress === checkAddress
            }).length === item.outputs.length

          let value = isSelf
            ? item.fees
            : item.outputs.filter((output) => {
              
              const currentAddress = output.addresses[0]

              return direction === 'in'
                ? (currentAddress === checkAddress)
                : (currentAddress !== checkAddress)
            })[0].value

          return({
            type,
            hash: item.hash,
            canEdit: (myWallets.indexOf(checkAddress) !== -1),
            confirmations: item.confirmations,
            value: new BigNumber(value).dividedBy(1e8).toNumber(),
            date: Date.parse(
              (item.confirmations)
                ? item.confirmed
                : item.received
            ),
            direction: isSelf ? 'self' : direction,
          })
        })

        resolve(transactions)
      } else {
        resolve([])
      }
    })
    .catch((e) => {
      console.error('Get btc txs Error', e)
      resolve([])
    })
  })
}

/** 
  Draft - взято из фронта, там не используется
  Но нужно реализовать
  игноры - явные ошибки - есть зависимости от фронта shared/actions/btc
  Ситауация такая - когда insight обновил свое апи, в быстром режиме нужно было
  восстанавливать фронт - эта функция должна использоваться для получения списка
  все транзакций на странице "История", но из-за изменений в их апи, быстрее было
  использовать блокрипер - в этой функции есть проблемы с получением адресов получателя-отправителя
**/
const getTransactionBitcore = (options) => {
  const {
    address,
    ownType,
    myWallets,
    network,
    apiBitpay,
    NETWORK,
  } = options
  
  return new Promise(async (resolve) => {
    // @ts-ignore
    const myAllWallets = getAllMyAddresses()
    // @ts-ignore
    let { user: { btcData: { address: userAddress } } } = getState()
    // @ts-ignore
    address = address || userAddress

    const type = (ownType) || 'btc'
    // @ts-ignore
    if (!typeforce.isCoinAddress.BTC(address)) {
      resolve([])
    }

    const blockInfo = await apiLooper.get(apiBitpay || getBitpay(NETWORK), `/block/tip`, {
      /* cache */
      /* query */
    })
    console.log('blockInfo', blockInfo)

    const url = `/address/${address}/txs`

    return apiLooper.get(apiBitpay, url, {
      checkStatus: (answer) => {
        try {
          if (answer && answer.txs !== undefined) return true
        } catch (e) { /* */ }
        return false
      },
      inQuery: {
        delay: 500,
        name: `bitpay`,
      },
    }).then((res: any) => {
      const transactions = res.txs.map((item) => {
        const direction = item.vin[0].addr !== address ? 'in' : 'out'

        const isSelf = direction === 'out'
          && item.vout.filter((item) => {
              const voutAddrBuf = Buffer.from(item.scriptPubKey.hex, 'hex')
              const currentAddress = bitcoin.address.fromOutputScript(voutAddrBuf, network)
              return currentAddress === address
          }).length === item.vout.length

        return({
          type,
          hash: item.txid,
          canEdit: (myWallets.indexOf(address) !== -1),
          confirmations: item.confirmations,
          value: isSelf
            ? item.fees
            : item.vout.filter((item) => {
              const voutAddrBuf = Buffer.from(item.scriptPubKey.hex, 'hex')
              const currentAddress = bitcoin.address.fromOutputScript(voutAddrBuf, network)

              return direction === 'in'
                ? (currentAddress === address)
                : (currentAddress !== address)
            })[0].value,
          date: item.time * 1000,
          direction: isSelf ? 'self' : direction,
        })
      })
      resolve(transactions)
    }).catch((error) => {
      console.error(error)
      resolve([])
    })
  })
}

const estimateFeeRateBLOCKCYPHER = (options) => {
  const {
    speed = 'fast',
    NETWORK,
  } = options

  const _speed = (() => {
    switch (speed) {
      case 'fast':    return 'high_fee_per_kb'
      case 'normal':  return 'medium_fee_per_kb'
      case 'slow':    return 'low_fee_per_kb'
      default:      return 'medium_fee_per_kb'
    }
  })()

  // 10 minuts cache
  // query request
  return apiLooper
    .get(getBlockcypher(NETWORK), ``, {
      cacheResponse: 10*60*1000,
      cacheOnFail: true,
      inQuery: {
        delay: 500,
        name: `blocyper`,
      },
    } )
    .then(info => Number(info[_speed]))
}

const estimateFeeRateEARNCOM = (options) => {
  const { speed = 'fast'} = options
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
  return apiLooper
    .get({
      name: 'EARN_COM',
      servers: `https://bitcoinfees.earn.com/api/v1/fees/recommended`,
    }, ``, {
      cacheResponse: 10*60*1000,
      cacheOnFail: true,
      inQuery: {
        delay: 500,
        name: `blocyper`,
      },
    } )
    .then(fees => Number(fees[_speed]) * 1024)
}

const estimateFeeRate = async (options) => {
  try {
    return await estimateFeeRateBLOCKCYPHER(options)
  } catch (err) {
    console.error(`EstimateFeeError: BLOCKCYPHER_API ${err.message}, trying EARN.COM...`)
    return await estimateFeeRateEARNCOM(options)
  }
}

const calculateTxSize = async (options) => {
  const {
    speed,
    unspents: _unspents,
    address,
    txOut = 2,
    NETWORK,
  } = options

  const unspents = _unspents || await fetchUnspents({
    address,
    NETWORK,
  })

  const txIn = unspents.length

  const txSize = txIn > 0
    ? txIn * 146 + txOut * 33 + (15 + txIn - txOut)
    : 226 // default tx size for 1 txIn and 2 txOut

  return txSize
}

const estimateFeeValue = async (options) => {
  const {
    feeRate: _feeRate,
    inSatoshis,
    speed,
    address,
    txSize: _txSize,
    NETWORK,
  } = options

  let calculatedFeeValue

  if (!_txSize && !address) {
    calculatedFeeValue = new BigNumber(DUST).multipliedBy(1e-8)
  } else {
    const txSize = _txSize || await calculateTxSize({ address, speed })
    const feeRate = _feeRate || await estimateFeeRate({ speed, NETWORK })

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

export default {
  fetchBalance,
  fetchTx,
  fetchTxInfo,
  fetchUnspents,
  broadcastTx,
  checkWithdraw,
  fetchTxRaw,
  getTransactionBlocyper,

  estimateFeeValue,
  getCore,

  prepareUnspents,
}