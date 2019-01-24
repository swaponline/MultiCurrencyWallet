import config from 'app-config'
import { getState } from 'redux/core'
import reducers from 'redux/core/reducers'
import constants from 'helpers/constants'
import actions from 'redux/actions'

import { eos, ecc } from 'helpers/eos'
import { Keygen } from 'eosjs-keygen'


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const generateAccountName = (publicKey) => {
  const account = Array.prototype.map.call(
    publicKey.substr(0, 12).toLowerCase(),
    (char) => (Number.isNaN(Number.parseInt(char, 10)) || char < 5) ? char : char - 4
  ).join('')

  return account
}

const updateActivationStatus = async () => {
  const { user: { eosData: { address, activePublicKey } } } = getState()

  const eosInstance = await eos.getInstance()
  const { permissions } = await eosInstance.getAccount(address)

  const accountActivePublicKey =
    permissions.find(item => item.perm_name === 'active')
      .required_auth.keys[0].key

  if (accountActivePublicKey === activePublicKey) {
    localStorage.setItem(constants.localStorage.eosAccountActivated, true)
    reducers.user.setAuthData({ name: 'eosData', data: { isAccountActivated: true } })
  } else {
    localStorage.setItem(constants.localStorage.eosAccountActivated, false)
    reducers.user.setAuthData({ name: 'eosData', data: { isAccountActivated: false } })
  }
}

const register = async (accountName, activePrivateKey) => {
  const eosInstance = await eos.getInstance()
  const eccInstance = await ecc.getInstance()
  const { permissions } = await eosInstance.getAccount(accountName)

  const activePublicKey = eccInstance.privateToPublic(activePrivateKey)

  const requiredPublicKey =
    permissions.find(item => item.perm_name === 'active')
      .required_auth.keys[0].key

  if (activePublicKey !== requiredPublicKey) {
    throw new Error(`${activePublicKey} is not equal to ${requiredPublicKey}`)
  }

  localStorage.setItem(constants.privateKeyNames.eosPrivateKey, activePrivateKey)
  localStorage.setItem(constants.privateKeyNames.eosPublicKey, activePublicKey)
  localStorage.setItem(constants.privateKeyNames.eosAccount, accountName)
  localStorage.setItem(constants.localStorage.eosAccountActivated, true)

  await login(accountName, activePrivateKey, activePublicKey)
}

const loginWithNewAccount = async () => {
  const keys = await Keygen.generateMasterKeys()

  const { privateKeys: { active: activePrivateKey }, publicKeys: { active: activePublicKey } } = keys

  const accountName = generateAccountName(activePublicKey)

  localStorage.setItem(constants.privateKeyNames.eosPrivateKey, activePrivateKey)
  localStorage.setItem(constants.privateKeyNames.eosPublicKey, activePublicKey)
  localStorage.setItem(constants.privateKeyNames.eosAccount, accountName)
  localStorage.setItem(constants.localStorage.eosAccountActivated, false)

  await login(accountName, activePrivateKey, activePublicKey)

  return { accountName, activePrivateKey, activePublicKey }
}

const login = async (accountName, activePrivateKey, activePublicKey) => {
  const isAccountActivated = localStorage.getItem(constants.localStorage.eosAccountActivated) === 'true'
  const isActivationPaymentSent = !!localStorage.getItem(constants.localStorage.eosActivationPayment)
  reducers.user.setAuthData({ name: 'eosData', data: { activePrivateKey, activePublicKey, address: accountName, isAccountActivated, isActivationPaymentSent } })
}

const waitAccountActivation = async () => {
  let eosAccountActivated = localStorage.getItem(constants.localStorage.eosAccountActivated) === 'true'

  while (!eosAccountActivated) {
    console.log('check eos activation...')

    // eslint-disable-next-line no-await-in-loop
    await actions.eos.updateActivationStatus()
    eosAccountActivated = localStorage.getItem(constants.localStorage.eosAccountActivated) === 'true'

    if (!eosAccountActivated) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(5000)
    }
  }
}

const buyAccount = async () => {
  const eosPrivateKey = localStorage.getItem(constants.privateKeyNames.eosPrivateKey)
  const accountName = localStorage.getItem(constants.privateKeyNames.eosAccount)
  let paymentTx = localStorage.getItem(constants.localStorage.eosActivationPayment)

  const eccInstance = await ecc.getInstance()
  const eosPublicKey = eccInstance.privateToPublic(eosPrivateKey)

  const { user: { btcData } } = getState()
  const btcAddress = btcData.address
  const btcPrivateKey = btcData.privateKey

  if (!paymentTx) {
    paymentTx = await sendActivationPayment({ from: btcAddress })
    localStorage.setItem(constants.localStorage.eosActivationPayment, paymentTx)
    reducers.user.setAuthData({ name: 'eosData', data: { isActivationPaymentSent: true } })
    actions.eos.waitAccountActivation()
  }

  const message = `${accountName}:${eosPublicKey}`
  const signature = await actions.btc.signMessage(message, btcPrivateKey)

  const activationTx = await activateAccount({
    accountName, eosPublicKey, btcAddress, signature, paymentTx,
  })

  if (activationTx) {
    console.log('eos account activated', activationTx)
  } else {
    console.log('eos account seems to be already activated')
  }
}

const sendActivationPayment = async ({ from }) => {
  const { user: { btcData: { balance } } } = getState()

  const { buyAccountPriceInBTC, buyAccountPaymentRecipient } = config.api.eos

  if (balance < buyAccountPriceInBTC) {
    throw new Error('Not enough balance to activate account')
  }

  const txid = await actions.btc.send({
    from,
    buyAccountPaymentRecipient,
    buyAccountPriceInBTC,
  })

  return txid.getId()
}

const activateAccount = async ({ accountName, eosPublicKey, btcAddress, signature, paymentTx }) => {
  const { registerEndpoint } = config.api.eos

  let transactionId = -1
  try {
    const response = await fetch(registerEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicKey: eosPublicKey,
        accountName,
        address: btcAddress,
        signature,
        txid: paymentTx,
      }),
    })

    transactionId = response.json().transactionId
  } catch (e) {
    console.error(e)
  }

  return transactionId
}

const getBalance = async () => {
  const { user: { eosData: { address } } } = getState()
  const eosAccountActivated = localStorage.getItem(constants.localStorage.eosAccountActivated) === 'true'

  if (typeof address !== 'string' || !eosAccountActivated) return

  const eosInstance = await eos.getInstance()
  try {
    const balance = await eosInstance.getCurrencyBalance({
      code: 'eosio.token',
      symbol: 'EOS',
      account: address,
    })
    const amount = Number.parseFloat(balance[0]) || 0
    reducers.user.setBalance({ name: 'eosData', amount })
    return amount
  } catch (e) {
    reducers.user.setBalanceError({ name: 'eosData' })
  }
}

const send = async ({ from, to, amount } = {}) => {
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
  loginWithNewAccount,
  updateActivationStatus,
  waitAccountActivation,
  register,
  getBalance,
  send,
  buyAccount,
}
