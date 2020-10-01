import apiLooper from './apiLooper'
import { BigNumber } from 'bignumber.js'


const fetchBalance = (address, withUnconfirmed, apiBitpay, cacheResponse) => {
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
  }).then((answer) => {
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
      fees: BigNumber(fee).dividedBy(1e8).toNumber(),
      ...rest,
    }
  ))
}

const fetchTxInfo = (hash, apiBitpay, cacheResponse, hasAdminFee) => {
  return new Promise(async (callback, txinfoReject) => {
    let baseTxInfo = false
    let txCoins = false

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
      amount,
      afterBalance,
      senderAddress,
      confirmed: !!(baseTxInfo.confirmations),
      confirmations: baseTxInfo.confirmations,
      receiverAddress,
      
      minerFee: baseTxInfo.fees,
      adminFee,
      minerFeeCurrency: 'BTC',
      // @ ToDo - need fix
      outputs: [], /* vout.map((out) => {
        const voutAddrBuf = Buffer.from(out.scriptPubKey.hex, 'hex')
        const currentAddress = bitcoin.address.fromOutputScript(voutAddrBuf, btc.network)
        return {
          amount: new BigNumber(out.value).toNumber(),
          address: currentAddress,
        }
      }),*/
      fees: baseTxInfo.fees,
      size: baseTxInfo.size,
    }

    callback( txInfo )
  })
}

const fetchUnspents = (address, apiBitpay, cacheResponse) => {
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
    ).then((answer) => {
      resolve(answer.map((txInfo, index) => {
        return {
          address,
          amount: BigNumber(txInfo.value).dividedBy(1e8).toNumber(),
          confirmations: txInfo.confirmations,
          height: txInfo.mintHeight,
          satoshis: txInfo.value,
          scriptPubKey: txInfo.script,
          txid: txInfo.mintTxid,
          vout: txInfo.mintIndex,
        }
      }))
    }).catch((error) => {
      console.error('btc fetchUnspents error', error)
    })
  })
}

const broadcastTx = (txRaw, apiBitpay, apiBlocyper) => {
  return new Promise(async (resolve, reject) => {
    let answer = false
    try {
      answer = await apiLooper.post(apiBitpay, `/tx/send`, {
        body: {
          rawTx: txRaw,
        },
        inQuery: {
          delay: 500,
          name: `bitpay`,
        },
      })
    } catch (e) {}
    if (!answer || !answer.txid) {
      // use blockcryper
      const bcAnswer = await apiLooper.post(apiBlocyper, `/txs/push`, {
        body: {
          tx: txRaw,
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
    } else {
      resolve(answer)
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


export default {
  fetchBalance,
  fetchTx,
  fetchTxInfo,
  fetchUnspents,
  broadcastTx,
  checkWithdraw,
  fetchTxRaw,
}