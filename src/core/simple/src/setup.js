import SwapApp, { constants } from 'swap.app'

const Wallet = require('./wallet')

const configFactory = require('./config')

const network = process.env.NETWORK

module.exports = (settings) => {

  const getConfig = configFactory[network || 'testnet']

  const config = getConfig({ contracts: {}, ...settings })

  
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
