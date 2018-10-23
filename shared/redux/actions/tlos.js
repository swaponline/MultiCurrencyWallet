import config from 'app-config'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import constants from 'helpers/constants'
import actions from 'redux/actions'

import { telos, ecc } from 'helpers/eos'
import { Keygen } from 'eosjs-keygen'

const generateAccountName = (publicKey) => {
  const account = Array.prototype.map.call(
    publicKey.substr(0, 12).toLowerCase(),
    (char) => (Number.isNaN(Number.parseInt(char, 10)) || char < 5) ? char : char - 4
  ).join('')

  return account
}

const privateToPublic = async (privateKey) => {
  const eccInstance = await ecc.getInstance()
  return eccInstance.privateToPublic(privateKey).replace('EOS', 'TLOS')
}

const register = async (accountName, activePrivateKey) => {
  const telosInstance = await telos.getInstance()
  const { permissions } = await telosInstance.getAccount(accountName)

  const givenPublicKey = await privateToPublic(activePrivateKey)

  const requiredPublicKey =
    permissions.find(item => item.perm_name === 'active')
      .required_auth.keys[0].key

  if (givenPublicKey !== requiredPublicKey)
    throw new Error(`${givenPublicKey} is not equal to ${requiredPublicKey}`)

  localStorage.setItem(constants.privateKeyNames.telos, activePrivateKey)
  localStorage.setItem(constants.privateKeyNames.telosAccount, accountName)

  const keys = {
    activePrivateKey: activePrivateKey,
    activePublicKey: givenPublicKey,
  }

  reducers.user.setAuthData({ name: 'telosData', data: { ...keys, address: accountName } })
}

const login = async (accountName, activePrivateKey) => {
  const activePublicKey = await privateToPublic(activePrivateKey)

  const keys = {
    activePrivateKey,
    activePublicKey
  }

  reducers.user.setAuthData({ name: 'telosData', data: { ...keys, address: accountName } })
}

const getBalance = async () => {
  const { user: { telosData: { address } } } = getState()

  if (typeof address !== 'string') return

  const telosInstance = await telos.getInstance()
  const balance = await telosInstance.getCurrencyBalance({
    code: 'eosio.token',
    symbol: 'TLOS',
    account: address,
  })

  const amount = Number.parseFloat(balance[0]) || 0

  reducers.user.setBalance({ name: 'telosData', amount })

  return amount
}

const send = async (from, to, amount) => {
  const { user: { telosData: { address } } } = getState()

  if (typeof address !== 'string') return

  const telosInstance = await telos.getInstance()
  const transfer = await telosInstance.transaction(
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
          quantity: `${amount}.0000 TLOS`,
          memo: '',
        },
      }],
    }
  )
}

const loginWithNewAccount = async () => {
  const eccInstance = await ecc.getInstance()

  const keys = await Keygen.generateMasterKeys()

  const { privateKeys: { active: activePrivateKey }} = keys

  const activePublicKey = await privateToPublic(activePrivateKey)

  const accountName = generateAccountName(activePublicKey)

  localStorage.setItem(constants.privateKeyNames.telos, activePrivateKey)
  localStorage.setItem(constants.privateKeyNames.telosAccount, accountName)
  localStorage.setItem(constants.localStorage.telosAccountActivated, false)

  await login(accountName, activePrivateKey)
  await activateAccount(accountName, activePrivateKey)
}

const activateAccount = async(accountName, activePrivateKey) => {
  const activePublicKey = await privateToPublic(activePrivateKey)

  const { registerEndpoint } = config.api.telos

  try {
    const response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publicKey: activePublicKey,
        accountName: accountName
      })
    })
    localStorage.setItem(constants.localStorage.telosAccountActivated, true)
  } catch(e) {
    console.error('Cannot activate telos account', e)
  }
}

module.exports = {
  register, login, getBalance, send, loginWithNewAccount, activateAccount
}
