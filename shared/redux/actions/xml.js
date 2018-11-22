import sdk from 'stellar-sdk'
import { getState } from 'redux/core'
import { constants, xml } from 'helpers'
import reducers from 'redux/core/reducers'


const server = xml.initServer()


const login = (privateKey) => {
  const keypair = privateKey
    ? sdk.Keypair.fromSecret(privateKey)
    : sdk.Keypair.random()

  localStorage.setItem(constants.privateKeyNames.xml, keypair.secret())

  const account = new sdk.Account(keypair.publicKey(), '1')
  const address = keypair.publicKey()

  const data = {
    account,
    keypair,
    address,
  }

  console.info('Logged in with Stellar', data)
  reducers.user.setAuthData({ name: 'xmlData', data })
}


const initAccount = (address) => {
  const admin = sdk.Keypair.fromSecret('SDA7HRNGXC5S4AWMTANDVBXLPVSDMRXGAURMACE2D3NQDO2M7I2STWUG')

  console.log('admin', admin)
  console.log('admin', admin.publicKey())

  return runOperation(admin, 'createAccount', {
    destination: address,
    startingBalance: String(50),
  })
}


const getBalance = () => {
  const { user: { xmlData: { address } } } = getState()

  if (typeof address !== 'string') {
    return Promise.reject(false)
  }

  console.log('address', address)

  return server.loadAccount(address)
    .then(({ balances }) => {
      console.log('XML Balance: ', balances)
      reducers.user.setBalance({ name: 'xmlData', amount: balances })
      return balances
    })
}

const runOperation = (from, type, options) => {
  const operationBuilder = sdk.Operation[type]

  if (!operationBuilder) {
    return Promise.reject(new Error(`Unknown operation type: ${type}`))
  }

  // Transaction will hold a built transaction we can resubmit if the result is unknown.
  var transaction
  // First, check to make sure that the destination account exists.
  // You could skip this, but if the account does not exist, you will be charged
  // the transaction fee when the transaction fails.
  return server.loadAccount(from.publicKey())
    .then(sourceAccount => {
      const operation = operationBuilder.call(sdk.Operation, options)

      // Start building the transaction.
      transaction = new sdk.TransactionBuilder(sourceAccount)
        .addOperation(operation)
        .build()

      // Sign the transaction to prove you are actually the person sending it.
      transaction.sign(from)
      // And finally, send it off to Stellar!
      return server.submitTransaction(transaction)
    })
}

export default {
  login,
  getBalance,
}
