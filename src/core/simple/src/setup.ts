import SwapApp, { constants } from 'swap.app'

import Wallet from './wallet'

import configFactory from './config'

const network = process.env.NETWORK

export default settings => {

  const useMnemonic = process.env.SECRET_PHRASE


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
