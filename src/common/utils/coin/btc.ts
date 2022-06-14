import apiLooper from '../apiLooper'
import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'
import typeforce from 'swap.app/util/typeforce'
import constants from 'common/helpers/constants'
import DEFAULT_CURRENCY_PARAMETERS from 'common/helpers/constants/DEFAULT_CURRENCY_PARAMETERS'

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
      } catch (error) {
        console.error('Utils - btc - fetch balance: ', error)
      }
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
      //@ts-ignore: strictNullChecks
      afterBalance = new BigNumber(afterOutput[0].value).dividedBy(1e8).toNumber()
    }

    if (adminOutput.length) {
      //@ts-ignore: strictNullChecks
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
      `/address/${address}?unspent=true&limit=1000000`,
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

interface IPrepareUnspentsOptions {
  amount: number,
  unspents: IBtcUnspent[],
}
/**
 * Processes the UTXO for the specified amount (in satoshi)
 **/
const prepareUnspents = (options: IPrepareUnspentsOptions): Promise<IBtcUnspent[]> => {
  const {
    amount,
    unspents,
  } = options

  return new Promise((resolve, reject) => {
    const needAmount = new BigNumber(amount).multipliedBy(1e8).plus(DUST)
    
    // Sorting all unspent inputs from minimum amount to maximum
    const sortedUnspents: IBtcUnspent[] = unspents.sort((a: IBtcUnspent, b: IBtcUnspent) => {
      return (new BigNumber(a.satoshis).isEqualTo(b.satoshis))
        ? 0
        : (new BigNumber(a.satoshis).isGreaterThan(b.satoshis))
          ? 1
          : -1
    })
    
    // let's try to find one unspent input which will enough for all commission
    //@ts-ignore: strictNullChecks
    let oneUnspent: IBtcUnspent = null
    sortedUnspents.forEach((unspent: IBtcUnspent) => {
      if (oneUnspent === null
        && new BigNumber(unspent.satoshis).isGreaterThanOrEqualTo(needAmount)
      ) {
        oneUnspent = unspent
        return false
      }
    })

    // if we didn't find one unspent then we're looking for
    // all unspent inputs which will enough (from min to max)
    if (oneUnspent === null) {
      let calcedAmount = new BigNumber(0)
      const usedUnspents: IBtcUnspent[] = sortedUnspents.filter((unspent: IBtcUnspent) => {
        if (calcedAmount.isGreaterThanOrEqualTo(needAmount)) {
          return false
        } else {
          calcedAmount = calcedAmount.plus(unspent.satoshis)
          return true
        }
      })
      resolve(usedUnspents)
    } else {
      resolve([oneUnspent])
    }
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
              reject(`Conflict`)
              return false
            } else {
              if (error
                && error.res
                && error.res.body
                && error.res.body.error
              ) {
                reject(error.res.body.error)
                return false
              }
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
          reject(`Cant decode answer`)
        }
      } catch (blocyperError) {
        if (onBroadcastError instanceof Function) {
          if (onBroadcastError(blocyperError)) reject(``)
        } else {
          reject(``)
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
    // has two or more txs on script
    if ((txs.length >= 1)
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

const fetchTxInputScript = (options) => {
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
  }).then((inInfo: any) => {
    if (inInfo
      && inInfo.inputs
      && inInfo.inputs.length === 1
    ) {
      return bitcoin.script.toASM(
        //@ts-ignore: strictNullChecks
        bitcoin.script.decompile(
          Buffer.from(inInfo.inputs[0].script, 'hex')
        )
      )
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

const getFeesRateBlockcypher = async ({ NETWORK }) => {
  const defaultRate = DEFAULT_CURRENCY_PARAMETERS.btc.rate

  const defaultApiSpeeds = {
    slow: defaultRate.slow,
    normal: defaultRate.normal,
    fast: defaultRate.fast,
    custom: 50 * 1024,
  }

  let apiResult

  try {
    // api returns sotoshi in 1 kb
    apiResult = await apiLooper
    .get(getBlockcypher(NETWORK), ``, {
      cacheResponse: 10*60*1000,
      cacheOnFail: true,
      inQuery: {
        delay: 500,
        name: `blocyper`,
      },
    } )
  } catch (err) {
    console.error({ info: err })
    return defaultApiSpeeds
  }

  const apiRate = {
    slow: apiResult.low_fee_per_kb,
    normal: apiResult.medium_fee_per_kb,
    fast: apiResult.high_fee_per_kb,
    custom: 50 * 1024,
  }

  return apiRate;
}

enum Network {
  mainnet = "mainnet",
  testnet = "testnet",
}

enum AddressType {
  p2pkh = "P2PKH",
  p2sh = "P2SH",
  p2wpkh = "P2WPKH",
  p2wsh = "P2WSH",
}

const addressTypes: { [key: number]: { type: AddressType, network: Network } } = {
  0x00: {
    type: AddressType.p2pkh,
    network: Network.mainnet,
  },

  0x6f: {
    type: AddressType.p2pkh,
    network: Network.testnet,
  },

  0x05: {
    type: AddressType.p2sh,
    network: Network.mainnet,
  },

  0xc4: {
    type: AddressType.p2sh,
    network: Network.testnet,
  },
};

const getAddressType = (address: string) => {
  const prefix = address.substr(0, 2)

  let data
  let addressType

  if (prefix === 'bc' || prefix === 'tb') {
    const { data: benchVersion } = bitcoin.address.fromBech32(address)
    data = benchVersion

    addressType = data.length === 20 ? AddressType.p2wpkh : AddressType.p2wsh
    return addressType

  } else {
    const { version } = bitcoin.address.fromBase58Check(address)
    let { type } = addressTypes[version]

    if (!type) {
      type = AddressType.p2pkh
      console.warn(`Unknown version '${version}' for address '${address}'.`)
    }

    return addressType = type || AddressType.p2pkh
  }
}
// getByteCount({'MULTISIG-P2SH:2-4':45},{'P2PKH':1}) Means "45 inputs of P2SH Multisig and 1 output of P2PKH"
// getByteCount({'P2PKH':1,'MULTISIG-P2SH:2-3':2},{'P2PKH':2}) means "1 P2PKH input and 2 Multisig P2SH (2 of 3) inputs along with 2 P2PKH outputs"
const getByteCount = (inputs, outputs) => {
const { TRANSACTION } = constants
let totalWeight = 0
let hasWitness = false
let inputCount = 0
let outputCount = 0
// assumes compressed pubkeys in all cases.
const types = {
  'inputs': {
    'MULTISIG-P2SH': TRANSACTION.MULTISIG_P2SH_IN_SIZE * 4,
    'MULTISIG-P2WSH': TRANSACTION.MULTISIG_P2WSH_IN_SIZE + (41 * 4),
    'MULTISIG-P2SH-P2WSH': TRANSACTION.MULTISIG_P2SH_P2WSH_IN_SIZE + (76 * 4),
    'P2PKH': TRANSACTION.P2PKH_IN_SIZE * 4,
    'P2WPKH': TRANSACTION.P2WPKH_IN_SIZE + (41 * 4),
    'P2SH-P2WPKH': TRANSACTION.P2SH_P2WPKH_IN_SIZE + (64 * 4),
  },
  'outputs': {
    'P2SH': TRANSACTION.P2SH_OUT_SIZE * 4,
    'P2PKH': TRANSACTION.P2PKH_OUT_SIZE * 4,
    'P2WPKH': TRANSACTION.P2WPKH_OUT_SIZE * 4,
    'P2WSH': TRANSACTION.P2WSH_OUT_SIZE * 4,
  },
}

const checkUInt53 = (n) => {
  if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range')
}

const varIntLength = (number) => {
  checkUInt53(number)

  return (
  number < 0xfd ? 1
    : number <= 0xffff ? 3
    : number <= 0xffffffff ? 5
      : 9
  )
}

Object.keys(inputs).forEach((key) => {
  checkUInt53(inputs[key])
  if (key.slice(0, 8) === 'MULTISIG') {
    // ex. "MULTISIG-P2SH:2-3" would mean 2 of 3 P2SH MULTISIG
    const keyParts = key.split(':')
    if (keyParts.length !== 2) throw new Error(`invalid input: ${key}`)
    const newKey = keyParts[0]
    const mAndN = keyParts[1].split('-').map((item) => parseInt(item))

    totalWeight += types.inputs[newKey] * inputs[key]
    const multiplyer = (newKey === 'MULTISIG-P2SH') ? 4 : 1
    totalWeight += ((73 * mAndN[0]) + (34 * mAndN[1])) * multiplyer * inputs[key]
  } else {
    totalWeight += types.inputs[key] * inputs[key]
  }
  inputCount += inputs[key]
  if (key.indexOf('W') >= 0) hasWitness = true
})

Object.keys(outputs).forEach((key) => {
  checkUInt53(outputs[key])
  totalWeight += types.outputs[key] * outputs[key]
  outputCount += outputs[key]
})

if (hasWitness) totalWeight += 2

totalWeight += 8 * 4
totalWeight += varIntLength(inputCount) * 4
totalWeight += varIntLength(outputCount) * 4

return Math.ceil(totalWeight / 4)
}

type CalculateTxSizeParams = {
  txIn?: number
  txOut?: number
  method?: string
  fixed?: boolean
  toAddress?: string
  serviceFee?: {
    address: any
    min: any
    fee: any
  } | any
  address?: string
}

const calculateTxSize = async (params: CalculateTxSizeParams) => {
  let {
    txIn,
    txOut,
    method = 'send',
    fixed,
    toAddress,
    serviceFee,
    address,
  } = params

  const { TRANSACTION } = constants
  const defaultTxSize = DEFAULT_CURRENCY_PARAMETERS.btc.size[method]

  let txSize = defaultTxSize

  if (fixed) {
    return txSize
  }
  const fromAddressType = address ? getAddressType(address) : "P2PKH";

  // general formula
  // (<one input size> × <number of inputs>) + (<one output size> × <number of outputs>) + <tx size>
  //@ts-ignore: strictNullChecks
  if (txIn > 0) {
    txSize =
    //@ts-ignore: strictNullChecks
    txIn * TRANSACTION[`${fromAddressType}_IN_SIZE`] +
    //@ts-ignore: strictNullChecks
    txOut * TRANSACTION.P2PKH_OUT_SIZE +
    //@ts-ignore: strictNullChecks
    (TRANSACTION.TX_SIZE + txIn - txOut)
  }

  if (method === 'send_multisig') {
    let outputs = {
      'P2SH': 1,
    }
    const toAddressType = toAddress ? getAddressType(toAddress) : "P2PKH";
    outputs[toAddressType] = ++outputs[toAddressType] || 1;

    if (serviceFee) {
      const adminAddressType = getAddressType(serviceFee.address);
      outputs[adminAddressType] = ++outputs[adminAddressType] || 1;
    }
    txSize = getByteCount(
      { 'MULTISIG-P2SH:2-2': 1 },
      outputs
    )
  }

  if (method === 'send_2fa') {
    let outputs = {
      'P2SH': 1,
    }
    const toAddressType = toAddress ? getAddressType(toAddress) : "P2PKH";
    outputs[toAddressType] = ++outputs[toAddressType] || 1;

    if (serviceFee) {
      const adminAddressType = getAddressType(serviceFee.address);
      outputs[adminAddressType] = ++outputs[adminAddressType] || 1;
    }
    txSize = getByteCount(
      { 'MULTISIG-P2SH:2-3': txIn },
      outputs
    )
  }

  return txSize
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
    //@ts-ignore: strictNullChecks
    .then(info => Number(info[_speed]))
}


const estimateFeeRate = async (options) => {
  const { speed } = options;
  const defaultRate = DEFAULT_CURRENCY_PARAMETERS.btc.rate
  try {
    return await estimateFeeRateBLOCKCYPHER(options)
  } catch (err) {
    console.error(`EstimateFeeError: BLOCKCYPHER_API ${err.message}, get default rate...`)
    return defaultRate[speed]
  }
}

const estimateFeeValue = async (options) => {
  const {
    feeRate: _feeRate,
    inSatoshis,
    speed,
    address,
    amount,
    toAddress,
    method,
    txSize: _txSize,
    swapUTXOMethod,
    serviceFee,
    fixed,
    moreInfo,
    NETWORK,
  } = options

  let calculatedFeeValue

  const SATOSHI_TO_BITCOIN_RATIO = 0.000_000_01

  if (!_txSize && !address) {
    calculatedFeeValue = new BigNumber(constants.TRANSACTION.DUST_SAT).multipliedBy(1e-8)
  } else {
    let unspents = await fetchUnspents({
      address,
      NETWORK,
    })
    // if user have some amount then try to find "better" UTXO for this
    if (amount) {
      unspents = await prepareUnspents({ amount, unspents })
    }
    // one input for output from the script when swapping
    const txIn = unspents.length
    // 2 = recipient input + sender input (for a residue)
    // 3 = the same inputs like higher + input for admin fee
    let txOut = serviceFee
    ? method === 'send'
      ? 3
      : 2
    : 2

    if (method === 'swap' && swapUTXOMethod === 'withdraw') {
      txOut = 1
    }

    const txSize = _txSize || await calculateTxSize({
      fixed,
      address,
      toAddress,
      method,
      txIn,
      txOut,
      serviceFee
    })
    const feeRate = _feeRate || await estimateFeeRate({ speed, NETWORK })

    calculatedFeeValue = BigNumber.maximum(
      constants.TRANSACTION.DUST_SAT,
      new BigNumber(feeRate)
        .multipliedBy(txSize)
        .div(1024)
        .dp(0, BigNumber.ROUND_HALF_EVEN),
    )

    if (moreInfo) {
      const moreInfoResponse = {
        fee: calculatedFeeValue.multipliedBy(SATOSHI_TO_BITCOIN_RATIO).toNumber(),
        satoshis: calculatedFeeValue.toNumber(),
        txSize,
        feeRate,
        unspents,
      }
      return moreInfoResponse
    }
  }

  const finalFeeValue = inSatoshis
    ? calculatedFeeValue.toString()
    : calculatedFeeValue.multipliedBy(SATOSHI_TO_BITCOIN_RATIO).toString()

  console.group('Common > coin >%c btc > estimateFeeValue', 'color: green;')
  console.log('fee value: ', finalFeeValue)
  console.groupEnd()

  return finalFeeValue
}

const prepareFees = async ({
  amount,
  serviceFee,
  feeValue,
  speed,
  method = 'send',
  from,
  to,
  NETWORK,
}) => {
  let feeFromAmount: number | BigNumber = new BigNumber(0)

  if (serviceFee) {
    const {
      fee: adminFee,
      min: adminFeeMinValue,
    } = serviceFee

    const adminFeeMin = new BigNumber(adminFeeMinValue)

    feeFromAmount = new BigNumber(adminFee).dividedBy(100).multipliedBy(amount)
    if (adminFeeMin.isGreaterThan(feeFromAmount)) feeFromAmount = adminFeeMin


    feeFromAmount = feeFromAmount.multipliedBy(1e8).integerValue() // Admin fee in satoshi

  }
  feeFromAmount = feeFromAmount.toNumber()
  try {
    feeValue = feeValue ?
      new BigNumber(feeValue).multipliedBy(1e8).toNumber() :
      await estimateFeeValue({
        inSatoshis: true,
        speed,
        method,
        address: from,
        toAddress: to,
        amount,
        serviceFee,
      })
  } catch (eFee) {
    return { message: `Fail estimate fee ` + eFee.message }
  }

  let unspents = []
  try {
    //@ts-ignore: strictNullChecks
    unspents = await fetchUnspents({address: from, NETWORK})
  } catch (eUnspents) {
    return { message: `Fail fetch unspents `+ eUnspents.message}
  }

  const toAmount = amount
  amount = new BigNumber(amount).multipliedBy(1e8).plus(feeValue).plus(feeFromAmount).multipliedBy(1e-8).toNumber()

  try {
    //@ts-ignore: strictNullChecks
    unspents = await prepareUnspents({ unspents, amount })
  } catch (eUnspents) {
    return { message: `Fail prepare unspents `+ eUnspents.message}
  }

  const fundValue = new BigNumber(toAmount).multipliedBy(1e8).integerValue().toNumber()

  const totalUnspent = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0)
  const skipValue = totalUnspent - fundValue - feeValue - feeFromAmount

  return {
    fundValue,
    skipValue,
    feeFromAmount,
    unspents,
  }
}

const prepareRawTx = async (params) => {
  const {
    from,
    to,
    fundValue,
    skipValue,
    serviceFee,
    feeFromAmount,
    method = 'send',
    unspents,
    privateKey,
    publicKeys = [Buffer.from('')],
    network,
    NETWORK
  } = params
  const psbt = new bitcoin.Psbt({network})

  psbt.addOutput({
    address: to,
    value: fundValue,
  })

  if (skipValue > 546) {
    psbt.addOutput({
      address: from,
      value: skipValue
    })
  }

  if (serviceFee) {
    psbt.addOutput({
      address: serviceFee.address,
      value: feeFromAmount,
    })
  }

  const keyPair = bitcoin.ECPair.fromWIF(privateKey, network)

  const hasOneSignature = !['send_2fa', 'send_multisig'].includes(method)

  if (hasOneSignature) {
    for (let i = 0; i < unspents.length; i++) {
      const { txid, vout } = unspents[i]
      let rawTx = ''

      try {
        rawTx = await fetchTxRaw({ txId: txid, cacheResponse: 5000, NETWORK })
      } catch (eFetchTxRaw) {
        return { message: `Fail fetch tx raw `+ txid + `(`+eFetchTxRaw.message+`)` }
      }

      psbt.addInput({
        hash: txid,
        index: vout,
        nonWitnessUtxo: Buffer.from(rawTx, 'hex'),
      })
    }

    psbt.signAllInputs(keyPair)
    psbt.finalizeAllInputs()

    return psbt.extractTransaction().toHex();
  }

  const p2ms = bitcoin.payments.p2ms({
    m: 2,
    n: publicKeys.length,
    pubkeys: publicKeys.map((key) => Buffer.from(key)),
    network,
  })

  for (let i = 0; i < unspents.length; i++) {
    const { txid, vout } = unspents[i]
    let rawTx = ''

    try {
      rawTx = await fetchTxRaw({ txId: txid, cacheResponse: 5000, NETWORK })
    } catch (eFetchTxRaw) {
      return { message: `Fail fetch tx raw `+ txid + `(`+eFetchTxRaw.message+`)` }
    }

    psbt.addInput({
      hash: txid,
      index: vout,
      redeemScript: p2ms.output,
      nonWitnessUtxo: Buffer.from(rawTx, 'hex'),
    })
  }

  psbt.signAllInputs(keyPair)
  return psbt.toHex()
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
  getFeesRateBlockcypher,

  estimateFeeValue,
  estimateFeeRate,
  calculateTxSize,
  getCore,

  prepareFees,
  prepareRawTx,

  prepareUnspents,

  fetchTxInputScript,
}