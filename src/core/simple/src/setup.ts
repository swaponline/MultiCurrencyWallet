import SwapApp, { constants } from 'swap.app'

import Wallet from './wallet'

import * as configFactory from './config'

const network = process.env.NETWORK

export default (settings) => {
  const useMnemonic = settings.mnemonic

  const getConfig = configFactory[network || 'testnet']

  const config = getConfig({
    contracts: {},
    ...settings,
    ...(useMnemonic) ? {
      mnemonic: useMnemonic,
    } : {}
  })

  const swapApp = SwapApp.init(config, true)

  const wallet = new Wallet(swapApp, constants, config)

  //@ts-ignore: strictNullChecks
  swapApp.services.wallet = wallet

  //@ts-ignore: strictNullChecks
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
