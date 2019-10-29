
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
  return eccInstance.privateToPublic(privateKey, 'TLOS')
}

const register = async (accountName, activePrivateKey) => {
  const telosInstance = await telos.getInstance()
  const { permissions } = await telosInstance.getAccount(accountName)

  const activePublicKey = await privateToPublic(activePrivateKey)

  const requiredPublicKey =
    permissions.find(item => item.perm_name === 'active')
      .required_auth.keys[0].key

  if (activePublicKey !== requiredPublicKey) {
    throw new Error(`${activePublicKey} is not equal to ${requiredPublicKey}`)
  }

  localStorage.setItem(constants.privateKeyNames.telosPrivateKey, activePrivateKey)
  localStorage.setItem(constants.privateKeyNames.telosPublicKey, activePublicKey)
  localStorage.setItem(constants.privateKeyNames.telosAccount, accountName)
  localStorage.setItem(constants.privateKeyNames.telosAccountActivated, true)

  reducers.user.setAuthData({ name: 'telosData', data: { activePrivateKey, activePublicKey, address: accountName } })
}

const login = (accountName, activePrivateKey, activePublicKey) => {
  reducers.user.setAuthData({ name: 'telosData', data: { activePrivateKey, activePublicKey, address: accountName } })
}

const getBalance = async () => {
  const { user: { telosData: { address } } } = getState()
  const telosAccountActivated = localStorage.getItem(constants.localStorage.telosAccountActivated) === 'true'

  if (typeof address !== 'string' || !telosAccountActivated) return

  try {
    const telosInstance = await telos.getInstance()
    const balance = await telosInstance.getCurrencyBalance({
      code: 'eosio.token',
      symbol: 'TLOS',
      account: address,
    })
    const amount = Number.parseFloat(balance[0]) || 0
    reducers.user.setBalance({ name: 'telosData', amount })
    return amount
  } catch (e) {
    reducers.user.setBalanceError({ name: 'telosData' })
  }
}

const send = async ({ from, to, amount } = {}) => {
  const { user: { telosData: { address } } } = getState()

  if (typeof address !== 'string') { return }

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
  const keys = await Keygen.generateMasterKeys()

  const { privateKeys: { active: activePrivateKey }, publicKeys } = keys

  const activePublicKey = publicKeys.active.toString().replace('EOS', 'TLOS')

  const accountName = generateAccountName(activePublicKey)

  localStorage.setItem(constants.privateKeyNames.telosPrivateKey, activePrivateKey)
  localStorage.setItem(constants.privateKeyNames.telosPublicKey, activePublicKey)
  localStorage.setItem(constants.privateKeyNames.telosAccount, accountName)
  localStorage.setItem(constants.localStorage.telosAccountActivated, false)

  login(accountName, activePrivateKey, activePublicKey)

  return { accountName, activePrivateKey, activePublicKey }
}


const activateAccount = async (accountName, activePrivateKey, activePublicKey) => {
  const { registerEndpoint } = config.api.telos

  try {
    const response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',

        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey: activePublicKey,
        accountName,
      }),
    })

    if (response.ok) {
      localStorage.setItem(constants.localStorage.telosAccountActivated, true)
    } else {
      console.error('tlos activation error')
    }
  } catch (e) {
    console.error('tlos network error', e)
  }
}

export default {
  register, login, getBalance, send, loginWithNewAccount, activateAccount,
}
