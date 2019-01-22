import sdk from 'stellar-sdk'
import { getState } from 'redux/core'
import { constants, xlm } from 'helpers'
import reducers from 'redux/core/reducers'


const login = (privateKey) => {
  const keypair = privateKey
    ? sdk.Keypair.fromSecret(privateKey)
    : sdk.Keypair.random()

  localStorage.setItem(constants.privateKeyNames.xlm, keypair.secret())

  const account = new sdk.Account(keypair.publicKey(), '1')
  const address = keypair.publicKey()

  const data = {
    account,
    keypair,
    address,
  }

  console.info('Logged in with Stellar', data)
  reducers.user.setAuthData({ name: 'xlmData', data })
}


const initAccount = (address) => {
  const key = 'SAXCEVKSHIKH3MSEK26NJ6HXBLNA5EMT7CDZIBYHHI3TLERQZ6RGGLRZ'
  const keyPair = sdk.Keypair.fromSecret(key)

  return runOperation(keyPair, 'createAccount', {
    destination: address,
    startingBalance: String(1.5),
  })
}


const getBalance = async () => {
  const { user: { xlmData: { address } } } = getState()

  if (typeof address !== 'string') {
    return
  }

  try {
    const { balances } = await xlm.server.loadAccount(address)
    const { balance } = balances[0]
    console.log('XLM balance', balance)
    reducers.user.setBalance({ name: 'xlmData', amount: balance })
    return balance
  } catch (e) {
    console.log(e.error || e)
    reducers.user.setBalanceError({ name: 'xlmData' })
  }
}


const runOperation = (from, type, options) => {
  const operationBuilder = sdk.Operation[type]

  if (!operationBuilder) {
    return Promise.reject(new Error(`Unknown operation type: ${type}`))
  }

  return xlm.server.loadAccount(from.publicKey())
    .then(sourceAccount => {
      const operation = operationBuilder.call(sdk.Operation, options)
      const tx = new sdk.TransactionBuilder(sourceAccount)
        .addOperation(operation)
        .build()

      tx.sign(from)
      return xlm.server.submitTransaction(tx)
    })
}


export default {
  login,
  initAccount,
  getBalance,
}
