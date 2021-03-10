import * as swap from './../src'

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, start, get },
  history: { saveInProgress, removeInProgress, saveFinished, getAllInProgress },
} = swap.helpers

const app = swap.setup({})
const { wallet, auth, room, orders } = app

const _ = (async () => {
  const info = await wallet.getBalance()
  console.log('balance:', info)

  await ready(room)
  console.log('info:', wallet.view())

  getAllInProgress().map(id => get(app, id)).map(swap => start(swap))
})()
