import * as swap from './../src'

const {
  on: { onFinish },
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, start },
  history: { saveInProgress, removeInProgress, saveFinished },
} = swap.helpers

const { wallet, auth, room, orders } = swap.setup({})

const doSwap = async order => {
  console.log('new order', order.id)
  if (Number(order.buyAmount) > 0.01) {
    const swap = await request(order)

    console.log('starting swap', swap.flow._flowName, swap.id)

    await start(swap)

    saveInProgress(swap.id)

    await onFinish(swap)

    console.log('finished swap', swap.id)
    removeInProgress(swap.id)
    saveFinished(swap.id)
  }
}

(async () => {
  const info = await wallet.getBalance()
  console.log('balance:', info)

  await ready(room)
  console.log('info:', wallet.view())

  //@ts-ignore: strictNullChecks
  orders.on('new orders', orders => orders.map(doSwap))
  //@ts-ignore: strictNullChecks
  orders.on('new order', doSwap)
})()
