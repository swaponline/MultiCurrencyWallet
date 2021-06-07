import { BASE_TOKEN_CURRENCY } from 'swap.app/constants/COINS'
import erc20Like from 'common/erc20Like'
import helpers from 'helpers'
import actions from 'redux/actions'
import apiLooper from 'helpers/apiLooper'

const getTokenBaseCurrency = (tokenKey) => {
  const baseCurrencyRegExp = /^\{[a-z]+\}/
  const baseTokenCurrencyPrefix = tokenKey.match(baseCurrencyRegExp)

  if (baseTokenCurrencyPrefix) {
    const baseTokenCurrency = baseTokenCurrencyPrefix[0].match(/[a-z]+/)
    const constantCurrency = baseTokenCurrency && BASE_TOKEN_CURRENCY[baseTokenCurrency[0].toUpperCase()]

    if (constantCurrency) {
      return constantCurrency.toLowerCase()
    }
  }

  return false
}

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
  if (erc20Like.isToken({ name: currency })) {
    return `/token/${currency}/tx/${txId}`
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

  if (erc20Like.erc20matic.isToken({ name: currency })) {
    return actions.erc20matic.getLinkToInfo(txId)
  }

  const prefix = helpers.getCurrencyKey(currency, false)

  if (actions[prefix]?.getLinkToInfo) {
    return actions[prefix].getLinkToInfo(txId)
  }

  console.warn(`Function getLinkToInfo for ${prefix} not defined`)
}

type GetInfoResult = {
  tx: string
  link: string
}

const getInfo = (currency, txRaw): GetInfoResult => {
  const prefix = helpers.getCurrencyKey(currency, true)
  const info = {
    tx: '',
    link: '',
  }

  if (actions[prefix]?.getTx) {
    const tx = actions[prefix].getTx(txRaw)
    const link = getLink(prefix, tx)

    info.tx = tx
    info.link = link
  } else {
    console.warn(`Function getTx for ${prefix} not defined`)
  }

  return info
}

export default {
  getInfo,
  getLink,
  getTxRouter,
  pullTxBalances,
  fetchTxBalances,
  getTokenBaseCurrency,
}
