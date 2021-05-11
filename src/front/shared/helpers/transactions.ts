import erc20Like from 'common/erc20Like'
import helpers from 'helpers'
import actions from 'redux/actions'
import apiLooper from 'helpers/apiLooper'


/**
 * Запрашивает информацию о tx (final balances)
 */
const fetchTxBalances = (currency, txId) => {
  const curName = helpers.getCurrencyKey(currency, true)
  return apiLooper.get('txinfo', `/tx/${curName}/${txId}`, {
    checkStatus: (res) => {
      try {
        if (res && res.answer !== undefined) return true
      } catch (e) { /* */ }
      return false
    },
  }).then((res: any) => {
    if (res
      && res.answer
      && res.answer === 'ok'
      && res.data
    ) {
      return res.data
    }
    return false

  }).catch((e) => false)
}

/**
 * Сохраняет информацию о балансах на момент выполнения транзакции на backend
 */
const pullTxBalances = (txId, amount, balances, adminFee) => apiLooper.post('txinfo', `/pull`, {
  body: {
    txId,
    amount,
    adminFee,
    ...balances,
  },
  checkStatus: (res) => {
    try {
      if (res && res.answer !== undefined) return true
    } catch (e) { /* */ }
    return false
  },
}).then(({ answer }) => answer).catch((e) => false)

const getTxRouter = (currency, txId) => {
  if (erc20Like.erc20.isToken({ name: currency })) {
    return actions.erc20.getTxRouter(txId, currency)
  }
  
  if (erc20Like.bep20.isToken({ name: currency })) {
    return actions.bep20.getTxRouter(txId, currency)
  }

  const prefix = helpers.getCurrencyKey(currency, false)

  if (actions[prefix]?.getTxRouter) {
    return actions[prefix].getTxRouter(txId, currency.toLowerCase())
  }

  console.warn(`Function getTxRouter for ${prefix} not defined (currency: ${currency})`)
}

const getLink = (currency, txId) => {
  if (erc20Like.erc20.isToken({ name: currency })) {
    return actions.erc20.getLinkToInfo(txId)
  }
  
  if (erc20Like.bep20.isToken({ name: currency })) {
    return actions.bep20.getLinkToInfo(txId)
  }

  const prefix = helpers.getCurrencyKey(currency, false)

  if (actions[prefix]?.getLinkToInfo) {
    return actions[prefix].getLinkToInfo(txId)
  }

  console.warn(`Function getLinkToInfo for ${prefix} not defined`)
}

const getInfo = (currency, txRaw) => {
  const prefix = helpers.getCurrencyKey(currency, false)

  if (actions[prefix]?.getTx) {
    const tx = actions[prefix].getTx(txRaw)
    const link =  getLink(prefix, tx)
    return {
      tx,
      link,
    }
  }
  console.warn(`Function getTx for ${prefix} not defined`)
  return {
    tx: '',
    link: '',
  }
}

export default {
  getInfo,
  getLink,
  getTxRouter,
  pullTxBalances,
  fetchTxBalances,
}
