import _debug from 'debug'

import { setup, helpers, constants } from '../../core/simple/src'
import { handleRequest, handleOrder, handleError, fillOrderbook, startSaved } from './actions'
import { TOKENS, TOKEN_DECIMALS } from '../config/constants'
import * as configStorage from '../config/storage'
import { tokenRegistrar } from '../../core/swap.app/util'
import { FG_COLORS as COLORS, colorString } from 'common/utils/colorString'


const debug = _debug('swap.bot')
const network = configStorage.getNetwork() || process.env.NETWORK || 'testnet'

const {
  room: {
    ready,
  },
} = helpers

//register unkronw tokens in core
Object.keys(TOKENS).filter((name) => !Object.keys(constants.COINS).includes(name))
  .map((name) => {
    tokenRegistrar.erc20.register(name.toLowerCase(), TOKENS[name].decimals)
  })

if (configStorage.hasTradeConfig()) {
  configStorage
    .getCustomERC20()
    .filter(({name}) => !Object.keys(constants.COINS).includes(name))
    .forEach((ercData) => {
      const {
        name,
        address,
        decimals,
      } = ercData

      TOKEN_DECIMALS[name] = decimals

      tokenRegistrar.erc20.register(name.toLowerCase(), decimals)
      TOKENS[name.toLowerCase()] = ercData
      console.log(
        colorString('>>> Add ERC token', COLORS.GREEN),
        colorString(name, COLORS.RED),
        colorString('[OK]', COLORS.GREEN)
      )
    })
}

const ERC20TOKENS = Object.keys(TOKENS)
  .filter((name) => Object.keys(constants.COINS).includes(name))
  .map((name) => ({
    ...TOKENS[name],
    name: name.toUpperCase(),
    tokenAddress: TOKENS[name].address,
  }))


let SwapApp, app, auth, wallet, room, orders, services

try {
  SwapApp = setup({
    network,
    ERC20TOKENS,
    mnemonic: configStorage.getMnemonic() || process.env.SECRET_PHRASE,
  })

  let { app, auth, wallet, room, orders, services } = SwapApp

  ready(room).then(() => {
    debug('room ready')
    debug('swaps', Object.keys(app.swaps).join(','))

    debug(auth.getPublicData())

    helpers.history.init(app)
    startSaved(app)

    const update = () => fillOrderbook(wallet, orders)

    update()

    setInterval(() => {
      console.log(
        colorString(`Refill order book`, COLORS.GREEN)
      )
      update()
    }, 10 * 60 * 1000)

    // orders.on('new orders', orders => orders.map(handleOrder(orders)))
    // orders.on('new order', handleOrder(orders))

    orders.on('new order request', handleRequest(app, wallet, orders))
  })
} catch (err) {
  console.log('Fail create swapApp', err)
  handleError(err)
}

export {
  SwapApp
}
