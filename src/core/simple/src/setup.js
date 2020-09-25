import SwapApp, { constants } from 'swap.app'

const Wallet = require('./wallet')

const configFactory = require('./config')

const network = process.env.NETWORK

module.exports = settings => {

  const useMnemonic = process.env.SECRET_PHRASE
  console.log('useMnemonic', useMnemonic)

  const getConfig = configFactory[network || 'testnet']

  const config = getConfig({
    contracts: {},
    ...settings,
    ...(useMnemonic) ? {
      mnemonic: useMnemonic,
    } : {}
  })

  const swapApp = SwapApp.init(config)

  const wallet = new Wallet(swapApp, constants, config)

  const { auth, room, orders } = swapApp.services

  const app = {
    app: swapApp,
    wallet,
    auth,
    room,
    orders,
  }

  return app
}
