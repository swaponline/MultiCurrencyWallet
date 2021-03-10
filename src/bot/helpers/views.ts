import * as os from 'os'
import * as ip from 'ip'


const OS = os.platform()
const IP = ip.address()
const HOST = (OS == 'darwin' || OS == 'win32')
    ? `localhost`
    : ( IP ? IP : `127.0.0.1` )
const PORT = process.env.PORT || 1337
const URL = `http://${HOST}:${PORT}`

const status = (order) => !order ? null : {
  id: order.id,
  accepted: order.accepted,
  isResolved: order.isProcessing,
  isRequested: order.isRequested,
  status: order.status,
}

const sendStatus = (req, res) => (order) => res.json(status(order))

const orderToString = (swap, full?) => {
  try {
    let link = `<a href="/orders/${swap.id}/start">start</a>`
    return [
      full ? link : '',
      swap.id.split('-').pop(),
      swap.isMy ? 'my' : '- ',
      swap.buyAmount, swap.buyCurrency,
      '→',
      swap.sellAmount, swap.sellCurrency,
      '[', swap.owner.peer.slice(0, 5), '...', swap.owner.peer.slice(-10), ']'
    ].join(' ')
  } catch (e) {
    return ''
  }
}

const swapView = (swap) => {
  let { flow, id } = swap

  return {
    type: flow._flowName,
    flow: flow ? flow.state : null,
    ...orderView(swap)
  }
}

const orderView = (order) => {
  if (!order) return {}

  let {
    id, isMy, swap,
    buyAmount, buyCurrency, sellAmount, sellCurrency,
    isRequested, isProcessing, isAccepted, isPartial,
    participant, requests,
    owner,
  } = order

  return {
    url: `${URL}/swaps/${id}/go`,
    handshake: isMy ? `${URL}/orders/${id}/accept` : `${URL}/orders/${id}/request`,
    requestPartial: isMy? `` : `${URL}/orders/${id}/request-partial?sellAmount=1`,
    //swap: `${URL}/swaps/${id}/go`,
    query: `swaps/${id}/go`,
    id, isMy, swap, string: orderToString(order),
    buyAmount, buyCurrency, sellAmount, sellCurrency,
    isRequested, isProcessing, isAccepted, isPartial,
    participant, requests,
    owner,
  }
}

export {
  orderToString,
  swapView,
  orderView,
}
