import config from 'app-config'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import constants from 'helpers/constants'

import { eos, ecc } from 'helpers/eos'
import { Keygen } from 'eosjs-keygen'


const register = async (accountName, privateKey) => {
  const keys = await Keygen.generateMasterKeys(privateKey)

  if (keys.masterPrivateKey !== privateKey) {
    throw new Error('Invalid private key')
  }

  const eosInstance = await eos.getInstance()
  const eccInstance = await ecc.getInstance()
  const { permissions } = await eosInstance.getAccount(accountName)

  const providedKey = eccInstance.privateToPublic(keys.privateKeys.active)

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

const createAccount = async () => {
  const keys = await Keygen.generateMasterKeys()
  const { masterPrivateKey, publicKeys: { active } } = keys

  localStorage.setItem(constants.privateKeyNames.eos, masterPrivateKey)
  reducers.user.setAuthData({ name: 'eosData', data: { ...keys } })

  console.log(`request to create account for ${active}`)
  const { registerEndpoint } = config.api.eos
  const response = await fetch(registerEndpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey: active }),
  })
  const { accountName, transaction_id: txid } = await response.json()

  if (!accountName) {
    throw new Error('Unable to register EOS address. Please contact team@swap.online for fix this issue')
  }

  console.log(`${accountName} was created at ${txid}`)

  localStorage.setItem(constants.privateKeyNames.eosAccount, accountName)
  reducers.user.setAuthData({ name: 'eosData', data: { address: accountName } })
}

const getBalance = async () => {
  const { user: { eosData: { address } } } = getState()

  if (typeof address !== 'string') return

  const eosInstance = await eos.getInstance()
  const balance = await eosInstance.getCurrencyBalance({
    code: 'eosio.token',
    symbol: 'EOS',
    account: address,
  })

  const amount = Number.parseFloat(balance[0]) || 0

  reducers.user.setBalance({ name: 'eosData', amount })

  return amount
}

const send = async (from, to, amount) => {
  const { user: { eosData: { address } } } = getState()

  if (typeof address !== 'string') return

  const eosInstance = await eos.getInstance()
  const transfer = await eosInstance.transaction(
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
  login,
  register,
  getBalance,
  send,
  createAccount,
}
