import { getState } from 'redux/core'
import config from 'app-config'
import reducers from 'redux/core/reducers'
import constants from 'helpers/constants'

import Eos from 'eosjs'

import { Keygen } from 'eosjs-keygen'

let eos = null;

const keyProvider = () => {
  return localStorage.getItem(constants.privateKeyNames.eos)
}

const init = async () => {
  if(eos === null) {
    const { chainId, httpEndpoint } = config.services.eos

    if (!chainId || !httpEndpoint )
      throw new Error('Invalid config')

    eos = Eos({
      chainId,
      httpEndpoint,
      keyProvider
    })
  }
}

const register = async (accountName, privateKey) => {
  const keys = await Keygen.generateMasterKeys(privateKey)

  if (keys.masterPrivateKey !== privateKey)
    throw new Error('Invalid private key')

  localStorage.setItem(constants.privateKeyNames.eos, privateKey)
  localStorage.setItem(constants.privateKeyNames.eosAccount, accountName)

  reducers.user.setAuthData({ name: 'eosData', data: { ...keys, address: accountName } } )
}

const login = async (accountName, masterPrivateKey) => {
  reducers.user.setAuthData({ name: 'eosData', data: { masterPrivateKey, address: accountName } })
}

const getBalance = async () => {
  const { user: { eosData: { address } } } = getState()

  if(eos === null || address == '')
    return;

  const balance = await eos.getCurrencyBalance({
    code: 'eosio.token',
    symbol: 'EOS',
    account: address
  })

  const amount = Number.parseFloat(balance[0]) || 0

  reducers.user.setBalance({ name: 'eosData', amount })
}

export default {
  init,
  login,
  register,
  getBalance
}
