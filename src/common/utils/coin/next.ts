import apiLooper from '../apiLooper'
import { BigNumber } from 'bignumber.js'


const fetchBalance = (options) => {
  const {
    address,
    API_ENDPOINT, // nextExplorerCustom
  } = options

  return apiLooper.get(API_ENDPOINT, `/address/${address}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.balance !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    ignoreErrors: true,
    reportErrors: (answer, onSuccess, onFail) => {
      onSuccess({ balance: 0 })
      return true
    },
  }).then(({ balance }) => balance)
}

const fetchUnspents = (options) => {
  const {
    address,
    API_ENDPOINT, // nextExplorerCustom
  } = options

  return apiLooper.get(API_ENDPOINT, `/addr/${address}/utxo`, { cacheResponse: 5000 })
}

const broadcastTx = (options) => {
  const {
    rawTx,
    API_ENDPOINT, // nextExplorer
  } = options

  return apiLooper.post(API_ENDPOINT, `/sendrawtransaction`, {
    body: {
      rawtx: rawTx,
    },
  })
}

const fetchTx = (options) => {
  const {
    hash,
    cacheResponse,
    API_ENDPOINT, // nextExplorer
  } = options

  return apiLooper.get(API_ENDPOINT, `/tx/${hash}`, {
    cacheResponse,
    checkStatus: (answer) => {
      try {
        if (answer && answer.txId !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then(({ fees, ...rest }) => ({
    fees: new BigNumber(fees).multipliedBy(1e8),
    ...rest,
  }))
}

/** to-to - in front has mark (not-working) - need recheck, may be will be fixed **/
const fetchTxInfo = (options) => {
  const {
    hash,
    cacheResponse,
    API_ENDPOINT, // nextExplorer
    hasAdminFee,
  } = options

  return fetchTx({
    hash,
    cacheResponse,
    API_ENDPOINT,
  }).then((txInfo_) => {
    return { ...txInfo_ } /** yes - ^^^^ not working - заглужка **/
    const { vin, vout, ...rest } = txInfo_
    const senderAddress = vin ? vin[0].addr : null
    const amount = vout ? new BigNumber(vout[0].value).toNumber() : null

    let afterBalance = vout && vout[1] ? new BigNumber(vout[1].value).toNumber() : null
    let adminFee: any = false

    if (hasAdminFee) {
      const adminOutput = vout.filter((out) => (
        out.scriptPubKey.addresses
        && out.scriptPubKey.addresses[0] === hasAdminFee.address
        && !(new BigNumber(out.value).eq(amount))
      ))

      const afterOutput = vout.filter((out) => (
        out.addresses
        && out.addresses[0] !== hasAdminFee.address
        && out.addresses[0] !== senderAddress
      ))

      if (afterOutput.length) {
        afterBalance = new BigNumber(afterOutput[0].value).toNumber()
      }

      if (adminOutput.length) {
        adminFee = new BigNumber(adminOutput[0].value).toNumber()
      }
    }

    const txInfo = {
      amount,
      afterBalance,
      senderAddress,
      receiverAddress: vout ? vout[0].scriptPubKey.addresses : null,
      confirmed: !!(rest.confirmations),
      minerFee: rest.fees.dividedBy(1e8).toNumber(),
      adminFee,
      minerFeeCurrency: 'NEXT',
      outputs: vout.map((out) => ({
        amount: new BigNumber(out.value).toNumber(),
        address: out.scriptPubKey.addresses || null,
      })),
      ...rest,
    }

    return txInfo
  })
}

const checkWithdraw = (options) => {
  const {
    scriptAddress,
    API_ENDPOINT, // nextExplorerCustom
  } = options

  return apiLooper.get(API_ENDPOINT, `/txs/${scriptAddress}`, {
    checkStatus: (answer) => {
      try {
        if (answer && answer.txs !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
    query: 'next_balance',
  }).then((res) => {
    if (res.txs.length > 1
      && res.txs[0].vout.length
    ) {
      const address = res.txs[0].vout[0].scriptPubKey.addresses[0]
      const amount = res.txs[0].vout[0].valueSat

      const {
        txid,
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

const estimateFeeValue = () => {}

export default { 
  fetchBalance,
  fetchUnspents,
  broadcastTx,
  fetchTx,
  fetchTxInfo,
  checkWithdraw,

  estimateFeeValue,
}