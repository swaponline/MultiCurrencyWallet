import apiLooper from './apiLooper'
import { BigNumber } from 'bignumber.js'
import * as bitcoin from 'bitcoinjs-lib'


const fetchBalance = (address, withUnconfirmed, apiBitpay, cacheResponse = null) => {
  return apiLooper.get(apiBitpay, `/address/${address}/balance/`, {
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

const fetchTx = (hash, apiBitpay, cacheResponse) => {
  return apiLooper.get(apiBitpay, `/tx/${hash}`, {
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

const fetchTxInfo = (hash, apiBitpay, cacheResponse, hasAdminFee) => {
  return new Promise(async (callback, txinfoReject) => {
    let baseTxInfo = false
    let txCoins: any = false

    try {
      baseTxInfo = await fetchTx(hash, apiBitpay, cacheResponse)
    } catch (error) {
      console.error('Fail fetch tx info', error)
      txinfoReject(error)
      return
    }
    try {
      txCoins = await apiLooper.get(apiBitpay, `/tx/${hash}/coins`, {
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
    let adminFee = false
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

const fetchUnspents = (address, apiBitpay, cacheResponse = null) => {
  return new Promise((resolve, reject) => {
    apiLooper.get(
      apiBitpay,
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
    })
  })
}

const broadcastTx = (txRaw, apiBitpay, apiBlocyper, onBroadcastError = null) => {
  return new Promise(async (resolve, reject) => {
    let answer: any = false
    try {
      answer = await apiLooper.post(apiBitpay, `/tx/send`, {
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
        const bcAnswer: any = await apiLooper.post(apiBlocyper, `/txs/push`, {
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
const checkWithdraw = (scriptAddress, apiBitpay) => {
  const url = `/address/${scriptAddress}/txs/`

  return apiLooper.get(apiBitpay, url, {
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
  }).then(async (txs) => {
    if ((txs.length > 0)
      && txs[0].mintTxid
      && txs[0].spentTxid
    ) {
      try {
        const spendTxInfo = await fetchTxInfo(txs[0].spentTxid, apiBitpay)
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

const fetchTxRaw = (txId, cacheResponse, apiBlocyper) => {
  return apiLooper.get(apiBlocyper, `/txs/${txId}?includeHex=true`, {
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

const getTransactionBlocyper = (address, ownType, myWallets, network, apiBlocyper) => {
  return new Promise((resolve) => {
    const type = (ownType) || 'btc'

    const url = `/addrs/${address}/full`
    apiLooper.get(
      apiBlocyper,
      url,
      {
        cacheResponse: 10*1000,
        inQuery: {
          delay: 500,
          name: `blocyper`,
        },
      }
    ).then((answer) => {
      if (answer
        && answer.txs
      ) {
        const transactions = answer.txs.map((item) => {
          const direction = item.inputs[0].addresses && item.inputs[0].addresses[0] !== address 
            ? 'in' 
            : 'out'

          const isSelf = direction === 'out'
            && item.outputs.filter((output) => {
                const voutAddrBuf = Buffer.from(output.script, 'hex')
                const currentAddress = bitcoin.address.fromOutputScript(voutAddrBuf, network)
                return currentAddress === address
            }).length === item.outputs.length

          let value = isSelf
            ? item.fees
            : item.outputs.filter((output) => {
              const voutAddrBuf = Buffer.from(output.script, 'hex')
              const currentAddress = bitcoin.address.fromOutputScript(voutAddrBuf, network)

              return direction === 'in'
                ? (currentAddress === address)
                : (currentAddress !== address)
            })[0].value

          return({
            type,
            hash: item.hash,
            canEdit: (myWallets.indexOf(address) !== -1),
            confirmations: item.confirmations,
            value: new BigNumber(value).dividedBy(1e8).toNumber(),
            date: (
              Math.floor(
                new Date(
                  (item.confirmations)
                  ? item.confirmed
                  : item.received
                )
              )
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

// Draft
const getTransactionBitcore = (address, ownType, myWallets, network, apiBitpay) => {
  return new Promise(async (resolve) => {
    const myAllWallets = getAllMyAddresses()

    let { user: { btcData: { address: userAddress } } } = getState()
    address = address || userAddress

    const type = (ownType) || 'btc'

    if (!typeforce.isCoinAddress.BTC(address)) {
      resolve([])
    }

    const blockInfo = await apiLooper.get(apiBitpay, `/block/tip`, {
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
    }).then((res) => {
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

export default {
  fetchBalance,
  fetchTx,
  fetchTxInfo,
  fetchUnspents,
  broadcastTx,
  checkWithdraw,
  fetchTxRaw,
  getTransactionBlocyper,
}