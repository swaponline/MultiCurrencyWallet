import { BASE_TOKEN_CURRENCY } from 'swap.app/constants/COINS'
import erc20Like from 'common/erc20Like'
import helpers from 'helpers'
import actions from 'redux/actions'

const getTokenBaseCurrency = (tokenKey) => {
  const baseCurrencyRegExp = /^\{[a-z1-2_]+\}/
  const baseTokenCurrencyPrefix = tokenKey.match(baseCurrencyRegExp)

  if (baseTokenCurrencyPrefix) {
    const baseTokenCurrency = baseTokenCurrencyPrefix[0].match(/[a-z1-2_]+/)
    const constantCurrency =
      baseTokenCurrency && BASE_TOKEN_CURRENCY[baseTokenCurrency[0].toUpperCase()]

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

const isToken = (standardKey, name) => erc20Like[standardKey].isToken({ name })

const getLink = (currency, txHash) => {
  if (isToken('erc20', currency)) {
    return actions.erc20.getLinkToInfo(txHash)
  }

  if (isToken('bep20', currency)) {
    return actions.bep20.getLinkToInfo(txHash)
  }

  if (isToken('erc20matic', currency)) {
    return actions.erc20matic.getLinkToInfo(txHash)
  }

  if (isToken('erc20xdai', currency)) {
    return actions.erc20xdai.getLinkToInfo(txHash)
  }

  if (isToken('erc20ftm', currency)) {
    return actions.erc20ftm.getLinkToInfo(txHash)
  }

  if (isToken('erc20avax', currency)) {
    return actions.erc20avax.getLinkToInfo(txHash)
  }

  if (isToken('erc20movr', currency)) {
    return actions.erc20movr.getLinkToInfo(txHash)
  }

  if (isToken('erc20one', currency)) {
    return actions.erc20one.getLinkToInfo(txHash)
  }

  if (isToken('erc20ame', currency)) {
    return actions.erc20ame.getLinkToInfo(txHash)
  }

  if (isToken('erc20aurora', currency)) {
    return actions.erc20aurora.getLinkToInfo(txHash)
  }

  if (isToken('phi20_v1', currency)) {
    return actions.phi20_v1.getLinkToInfo(txHash)
  }

  if (isToken('phi20', currency)) {
    return actions.phi20.getLinkToInfo(txHash)
  }
  if (isToken('fkw20', currency)) {
    return actions.fkw20.getLinkToInfo(txHash)
  }
  if (isToken('phpx20', currency)) {
    return actions.phpx20.getLinkToInfo(txHash)
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

  if (isToken('erc20', currency)) {
    reduxAction = `erc20`
  }

  if (isToken('bep20', currency)) {
    reduxAction = `bep20`
  }

  if (isToken('erc20matic', currency)) {
    reduxAction = `erc20matic`
  }

  if (isToken('erc20xdai', currency)) {
    reduxAction = `erc20xdai`
  }

  if (isToken('erc20ftm', currency)) {
    reduxAction = `erc20ftm`
  }

  if (isToken('erc20avax', currency)) {
    reduxAction = `erc20avax`
  }

  if (isToken('erc20movr', currency)) {
    reduxAction = `erc20movr`
  }

  if (isToken('erc20one', currency)) {
    reduxAction = `erc20one`
  }

  if (isToken('erc20ame', currency)) {
    reduxAction = `erc20ame`
  }

  if (isToken('erc20aurora', currency)) {
    reduxAction = `erc20aurora`
  }

  if (isToken('phi20_v1', currency)) {
    reduxAction = `phi20_v1`
  }

  if (isToken('phi20', currency)) {
    reduxAction = `phi20`
  }

  if (isToken('fkw20', currency)) {
    reduxAction = `fkw20`
  }
  
  if (isToken('phpx20', currency)) {
    reduxAction = `phpx20`
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
