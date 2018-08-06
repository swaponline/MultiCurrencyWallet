import { getState } from 'redux/core'
import config from 'app-config'
import reducers from 'redux/core/reducers'
import constants from 'helpers/constants'

import { Keygen } from 'eosjs-keygen'


let eos = null
let ecc = null

const keyProvider = ({ transaction, pubkeys }) => {
  const { user: { eosData: { privateKeys, publicKeys } } } = getState()

  if (!pubkeys) {
    return [publicKeys.active]
  }

  return [privateKeys.active]
}

const init = async () => {
  if (eos === null) {
    const EOSLibrary = await import('eosjs')

    const { chainId, httpEndpoint } = config.services.eos

    if (!chainId || !httpEndpoint) {
      throw new Error('Invalid config')
    }

    eos = EOSLibrary({
      chainId,
      httpEndpoint,
      keyProvider,
    })

    ecc = EOSLibrary.modules.ecc
  }
}

const register = async (accountName, privateKey) => {
  const keys = await Keygen.generateMasterKeys(privateKey)

  if (keys.masterPrivateKey !== privateKey) {
    throw new Error('Invalid private key')
  }

  const { permissions } = await eos.getAccount(accountName)

  const providedKey = ecc.privateToPublic(keys.privateKeys.active)

  const requiredKey =
    permissions.find(item => item.perm_name === 'active')
      .required_auth.keys[0].key

  if (providedKey !== requiredKey) {
    throw new Error('Invalid accounts permissions')
  }

  localStorage.setItem(constants.privateKeyNames.eos, privateKey)
  localStorage.setItem(constants.privateKeyNames.eosAccount, accountName)

  reducers.user.setAuthData({ name: 'eosData', data: { ...keys, address: accountName } })
}

const login = async (accountName, masterPrivateKey) => {
  const keys = await Keygen.generateMasterKeys(masterPrivateKey)
  reducers.user.setAuthData({ name: 'eosData', data: { ...keys, address: accountName } })
}

const getBalance = async () => {
  const { user: { eosData: { address } } } = getState()

  if (eos === null || typeof address === 'string') {
    return
  }

  const balance = await eos.getCurrencyBalance({
    code: 'eosio.token',
    symbol: 'EOS',
    account: address,
  })

  const amount = Number.parseFloat(balance[0]) || 0

  reducers.user.setBalance({ name: 'eosData', amount })
}

const send = async (from, to, amount) => {
  const { user: { eosData: { address } } } = getState()

  if (eos === null || typeof address === 'string') {
    return
  }

  const transfer = await eos.transaction(
    {
      actions: [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: from,
          permission: 'active',
        }],
        data: {
          from,
          to: to.trim(),
          quantity: `${amount}.0000 EOS`,
          memo: '',
        },
      }],
    }
  )
}

export default {
  init,
  login,
  register,
  getBalance,
  send,
}
