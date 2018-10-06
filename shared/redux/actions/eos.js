import config from 'app-config'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import constants from 'helpers/constants'
import actions from 'redux/actions'

import { eos, ecc } from 'helpers/eos'
import { Keygen } from 'eosjs-keygen'

const generateAccountName = (publicKey) => {
  const account = Array.prototype.map.call(
    publicKey.substr(0, 12).toLowerCase(),
    (char) => (Number.isNaN(Number.parseInt(char, 10)) || char < 5) ? char : char - 4
  ).join('')

  return account
}

const prepareAccount = async () => {
  const keys = await Keygen.generateMasterKeys()

  const { masterPrivateKey, publicKeys: { active } } = keys

  const accountName = generateAccountName(active)

  const { buyAccountPriceInBTC } = config.api.eos

  return {
    masterPrivateKey: masterPrivateKey,
    publicKey: active,
    accountName: accountName,
    price: buyAccountPriceInBTC
  }
}

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

const requestToCreateAccount = async ({ publicKey, accountName, address, signature, txid }) => {
  const { registerEndpoint } = config.api.eos

  const response = await fetch(registerEndpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey, accountName, address, signature, txid }),
  })

  const { transaction_id } = await response.json()

  return transaction_id
}

const payForAccountCreation = async (senderAddress) => {
  const { buyAccountPriceInBTC, buyAccountPaymentRecipient } = config.api.eos

  const txid = await actions.btc.send(senderAddress, buyAccountPaymentRecipient, buyAccountPriceInBTC)

  return txid
}

const buyAccount = async (masterPrivateKey, paymentTxId) => {
  const keys = await Keygen.generateMasterKeys(masterPrivateKey)
  const {publicKeys: {active: eosPublicKey}, privateKeys: {active: eosPrivateKey}} = keys
  const accountName = generateAccountName(eosPublicKey)

  const {user: {btcData: {address: btcAddress, privateKey: btcPrivateKey}}} = getState()

  localStorage.setItem(constants.privateKeyNames.eos, eosPrivateKey)
  localStorage.setItem(constants.privateKeyNames.eosAccount, accountName)
  reducers.user.setAuthData({name: 'eosData', data: {...keys, address: accountName}})

  if (!paymentTxId) {
    const paymentTx = await payForAccountCreation(btcAddress)
    paymentTxId = paymentTx.getId()
  }

  const message = `${accountName}:${eosPublicKey}`
  const signature = await actions.btc.signMessage(message, btcPrivateKey)

  const creationTxId = await requestToCreateAccount({
    accountName: accountName,
    publicKey: eosPublicKey,
    address: btcAddress,
    signature: signature,
    txid: paymentTxId
  })

  console.log(`${accountName} created at ${creationTxId}`)

  return { paymentTxId, creationTxId }
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
  buyAccount,
  prepareAccount
}
