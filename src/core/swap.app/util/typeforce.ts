import typeforce from 'typeforce'
import constants from '../constants'
import { ETH_TOKENS } from '../constants/COINS'

const check = (...args) => {
  try {
    return typeforce(...args)
  }
  catch (err) {
    console.error(err)
    return false
  }
}

const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value)

const isCoinName = (value) => Object.values(constants.COINS).filter(
  (v: any) => (v.ticker)
    ? v.ticker.toLowerCase() === value.toLowerCase()
    : v.toLowerCase() === value.toLowerCase(),
).length > 0

const EVM_ADDRESS_REGEXP = /^0x[A-Fa-f0-9]{40}$/
const isEvmAddress = (value) => typeof value === 'string' && EVM_ADDRESS_REGEXP.test(value)

const isCoinAddress = { // TODO: move to front helpers
  [constants.COINS.eth]: isEvmAddress,
  [constants.COINS.bnb]: isEvmAddress,
  [constants.COINS.matic]: isEvmAddress,
  [constants.COINS.arbeth]: isEvmAddress,
  [constants.COINS.aureth]: isEvmAddress,
  [constants.COINS.xdai]: isEvmAddress,
  [constants.COINS.ftm]: isEvmAddress,
  [constants.COINS.avax]: isEvmAddress,
  [constants.COINS.movr]: isEvmAddress,
  [constants.COINS.one]: isEvmAddress,
  [constants.COINS.ame]: isEvmAddress,
  [constants.COINS.phi_v1]: isEvmAddress,
  [constants.COINS.phi]: isEvmAddress,
  [constants.COINS.fkw]: isEvmAddress,
  [constants.COINS.phpx]: isEvmAddress,
  [constants.COINS.btc]: (value) => typeof value === 'string' && /^[A-Za-z0-9]{26,35}$/.test(value),
  [constants.COINS.ghost]: (value) => typeof value === 'string' && /^[A-Za-z0-9]{26,35}$/.test(value),
  [constants.COINS.next]: (value) => typeof value === 'string' && /^[A-Za-z0-9]{26,35}$/.test(value),
  // [constants.COINS.usdt]: (value) => typeof value === 'string',
}

const isPublicKey = {
  [constants.COINS.eth]: '?String', // TODO we don't have / use eth publicKey
  [constants.COINS.bnb]: '?String',
  [constants.COINS.matic]: '?String',
  [constants.COINS.arbeth]: '?String',
  [constants.COINS.aureth]: '?String',
  [constants.COINS.xdai]: '?String',
  [constants.COINS.ftm]: '?String',
  [constants.COINS.avax]: '?String',
  [constants.COINS.movr]: '?String',
  [constants.COINS.one]: '?String',
  [constants.COINS.ame]: '?String',
  [constants.COINS.phi_v1]: '?String',
  [constants.COINS.phi]: '?String',
  [constants.COINS.fkw]: '?String',
  [constants.COINS.phpx]: '?String',
  [constants.COINS.btc]: (value) => typeof value === 'string' && /^[A-Za-z0-9]{66}$/.test(value),
  [constants.COINS.ghost]: (value) => typeof value === 'string' && /^[A-Za-z0-9]{66}$/.test(value),
  [constants.COINS.next]: (value) => typeof value === 'string' && /^[A-Za-z0-9]{66}$/.test(value),
  // [constants.COINS.usdt]: '?String', // TODO we don't have / use nim publicKey
}

Object.keys(ETH_TOKENS).forEach((tokenCode) => {
  isCoinAddress[ETH_TOKENS[tokenCode]] = isEvmAddress
  isPublicKey[ETH_TOKENS[tokenCode]] = '?String'
})

export default {
  t: typeforce,
  check,
  isNumeric,
  isCoinName,
  isCoinAddress,
  isPublicKey,
}
