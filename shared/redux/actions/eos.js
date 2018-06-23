import { getState } from 'redux/core'
import config from 'app-config'
import reducers from 'redux/core/reducers'

import eos from 'helpers/eos'
import constants from 'helpers/constants'

import { Keygen } from 'eosjs-keygen'

// Pure function to generate account associated with user,
// because multiple accounts can be owned by one authority in eos
const generateAccountName = (publicKey) => {
  const account = Array.prototype.map.call(
    publicKey.substr(0, 12).toLowerCase(),
    (char) => (Number.isNaN(Number.parseInt(char, 10)) || char < 5) ? char : char - 4
  ).join('')

  return account
}

const createAccount = (keys, name) => {
  const serviceAccount = config.services.eos.serviceAccount

  return eos.transaction(tx => {
    tx.newaccount({
      creator: serviceAccount,
      owner: keys.publicKeys.owner,
      active: keys.publicKeys.active,
      name,
    })

    tx.buyrambytes({
      payer: serviceAccount,
      receiver: name,
      bytes: 8192,
    })
  })
}

const login = (privateKey) => {
  Keygen.generateMasterKeys(privateKey).then(keys => {
    const accountName = generateAccountName(keys.publicKeys.active)

    const data = { ...keys, address: accountName }

    // we suppose that user has already registered account
    // when function is being called with correct private key
    if (keys.masterPrivateKey === privateKey) {
      return data
    }

    return createAccount(keys, accountName).then(result => {
      console.info(`Created EOS account ${accountName} at ${result.transaction_id}`)

      localStorage.setItem(constants.privateKeyNames.eos, keys.masterPrivateKey)

      return data
    })
  }).then(data => {
    reducers.user.setAuthData({ name: 'eosData', data })
  })
}

const getBalance = () => {
  const { user: { eosData: { address } } } = getState()

  console.log(`EOS ADDRESS: ${address}`)

  return eos.getCurrencyBalance({
    code: 'eosio.token',
    symbol: 'EOS',
    account: address,
  }).then(result => {
    const amount = Number.parseFloat(result[0]) || 0

    reducers.user.setBalance({ name: 'eosData', amount })
  })
}

export default {
  login,
  getBalance,
}
