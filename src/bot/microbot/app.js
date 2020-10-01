import _debug from 'debug'
import { setup, helpers, constants } from '../../core/simple/src'
import { handleRequest, handleOrder, handleError, fillOrderbook, startSaved } from './actions'
import { TOKENS } from '../config/constants'
import lineInput from './lineInput'

import { erc20 } from '../../core/swap.app/util'

const debug = _debug('swap.bot')
const network = process.env.NETWORK || 'testnet'
const {
  room: {
    ready,
  },
} = helpers

//register unkronw tokens in core
console.log('Register unkrown tokens', erc20 )
Object.keys(TOKENS).filter((name) => !Object.keys(constants.COINS).includes(name))
  .map((name) => {
    erc20.register(name.toLowerCase(), TOKENS[name].decimals)
    console.log('UNKRONW TOKEN:',name)
  })
const ERC20TOKENS = Object.keys(TOKENS)
  .filter((name) => Object.keys(constants.COINS).includes(name))
  .map((name) => ({
    ...TOKENS[name],
    name: name.toUpperCase(),
    tokenAddress: TOKENS[name].address,
  }))

let SwapApp

try {

  SwapApp = setup({ network, ERC20TOKENS })
  const { app, auth, wallet, room, orders } = SwapApp

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
  handleError(err)
}

module.exports = SwapApp
