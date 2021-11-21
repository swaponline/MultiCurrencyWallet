import { BASE_TOKEN_CURRENCY } from 'swap.app/constants/COINS'
import erc20Like from 'common/erc20Like'
import helpers from 'helpers'
import actions from 'redux/actions'


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

const getTxRouter = (currency, txHash) => {
  if (erc20Like.isToken({ name: currency })) {
    return `/token/${currency}/tx/${txHash}`
  }

  const prefix = helpers.getCurrencyKey(currency, false)

  if (actions[prefix]?.getTxRouter) {
    return actions[prefix].getTxRouter(txHash, currency.toLowerCase())
  }

  console.warn(`Function getTxRouter for ${prefix} not defined (currency: ${currency})`)
}

const getLink = (currency, txHash) => {
  if (erc20Like.erc20.isToken({ name: currency })) {
    return actions.erc20.getLinkToInfo(txHash)
  }

  if (erc20Like.bep20.isToken({ name: currency })) {
    return actions.bep20.getLinkToInfo(txHash)
  }

  if (erc20Like.erc20matic.isToken({ name: currency })) {
    return actions.erc20matic.getLinkToInfo(txHash)
  }

  const prefix = helpers.getCurrencyKey(currency, false)

  if (actions[prefix]?.getLinkToInfo) {
    return actions[prefix].getLinkToInfo(txHash)
  }

  console.warn(`Function getLinkToInfo for ${prefix} not defined`)
}

type GetInfoResult = {
  tx: string
  link: string
}

const getInfo = (currency, txRaw): GetInfoResult => {
  let reduxAction = helpers.getCurrencyKey(currency, true)
  if (erc20Like.erc20.isToken({ name: currency })) {
    reduxAction = `erc20`
  }

  if (erc20Like.bep20.isToken({ name: currency })) {
    reduxAction = `bep20`
  }

  if (erc20Like.erc20matic.isToken({ name: currency })) {
    reduxAction = `erc20matic`
  }

  const info = {
    tx: '',
    link: '',
  }

  if (actions[reduxAction]?.getTx) {
    const tx = actions[reduxAction].getTx(txRaw)
    const link = getLink(currency, tx)

    info.tx = tx
    info.link = link
  } else {
    console.warn(`Function getTx for ${reduxAction} not defined`)
  }

  return info
}

export default {
  getInfo,
  getLink,
  getTxRouter,
  getTokenBaseCurrency,
}
