import swap from './../src'

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, start, get },
  history: { saveInProgress, removeInProgress, saveFinished, getAllInProgress },
} = swap.helpers
//@ts-ignore
const { wallet, auth, room, orders } = swap.setup()

const _ = (async () => {
  const info = await wallet.getBalance()
  console.log('balance:', info)

  await ready(room)
  console.log('info:', wallet.view())
  //@ts-ignore
  getAllInProgress().map(id => get(id)).map(swap => start(swap))
})()
