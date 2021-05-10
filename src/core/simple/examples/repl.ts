import * as swap from './../src/index'
import repl from 'repl'

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, get, start },
} = swap.helpers

const app = swap.setup({})
const { auth, room, wallet, orders } = app

const swapID = process.argv[2]

console.clear()
console.log('IPFS loading...')
console.log('REPL getting ready...')

const _ = (async () => {
  await ready(room)

  console.clear()
  console.log('Swap id =', swapID)
  console.log()

  const [ peer, id ] = swapID.split('-')

  //@ts-ignore: strictNullChecks
  if (peer !== room.peer) {
    //@ts-ignore: strictNullChecks
    console.log(`Peers do not match:`, peer, room.peer)
  }

  const swap = get(app, swapID)

  console.log(`swap.flow.state =`, swap.flow.state)
  console.log()

  const swap_repl = repl.start()
  swap_repl.context.swap = swap
  swap_repl.context.auth = auth
  swap_repl.context.room = room
  swap_repl.context.wallet = wallet
  swap_repl.context.orders = orders
})()
