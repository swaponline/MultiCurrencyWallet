import _debug from 'debug'
import { setup, helpers, constants } from '../../core/simple/src'
import { handleRequest, handleOrder, handleError, fillOrderbook, startSaved } from './actions'
import { TOKENS } from '../config/constants'
import lineInput from './lineInput'
import * as configStorage from '../config/storage'
import { erc20 } from '../../core/swap.app/util'

const debug = _debug('swap.bot')
const network = configStorage.getNetwork() || process.env.NETWORK || 'testnet'

const {
  room: {
    ready,
  },
} = helpers

//register unkronw tokens in core
console.log('Register unkrown tokens', erc20)
Object.keys(TOKENS).filter((name) => !Object.keys(constants.COINS).includes(name))
  .map((name) => {
    erc20.register(name.toLowerCase(), TOKENS[name].decimals)
    console.log('UNKRONW TOKEN:', name)
  })
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
    setInterval(update, 10 * 60 * 1000)

    // orders.on('new orders', orders => orders.map(handleOrder(orders)))
    // orders.on('new order', handleOrder(orders))

    orders.on('new order request', handleRequest(app, wallet, orders))
  })
} catch (err) {
  console.log('Fail create swapApp',err)
  handleError(err)
}

export {
  SwapApp
}