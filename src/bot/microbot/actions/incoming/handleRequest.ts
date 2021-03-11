import BigNumber from 'bignumber.js'
import _debug from 'debug'

import SwapApp from 'swap.app'

import handleError from '../../../app/actions/errors/handleError'
import beginSwap from '../start/beginSwap'

import fetchOrder from '../../core/fetchOrder'
import replyToRequest from '../../core/replyToRequest'
import { checkParticipantAddress } from '../../core/checkAddress'
import { checkParticipant } from '../../core/checkParticipant'
import { checkSwapsCountLimit } from '../../core/checkSwapsCountLimit'


const debug = _debug('swap.bot')


export default (app, wallet, orders) => async ({ orderId, participant }) => {
  debug(`[REQUEST] from ${participant.peer} at order ${orderId}`)

  const order = fetchOrder(orders)(orderId)

  if (!order) {
    return handleError(new Error(`not found such order, maybe creator is offline? id: ${orderId}`))
  }

  const balances = await wallet.getBalance([order.sellCurrency])
  const balance = balances[0].value

  const participantAddress = order.requests[0].participant.eth.address

  const isParticipantAddressOkay = await checkParticipantAddress({
    participantAddress,
    buyCurrency: order.buyCurrency,
    buyAmount: order.buyAmount,
    sellAmount: order.sellAmount,
  })

  if (!checkSwapsCountLimit()) {
    replyToRequest(orders)({ orderId, participant }, false)
    return false
  }

  if (!checkParticipant(participant)) {
    // One swap with one participant
    replyToRequest(orders)({ orderId, participant }, false)
    return false
  }

  const isEnoughBalance = new BigNumber(balance).isGreaterThan(order.sellAmount)
  const isAccepted = isEnoughBalance && isParticipantAddressOkay

  debug('handleRequest:', 'bot balance', balance, 'order amount', order.sellAmount.toString())

  if (!isAccepted) {
    replyToRequest(orders)({ orderId, participant }, isAccepted)

    return handleError(new Error(`is enough balance: ${isEnoughBalance},
      is participant address okay: ${isParticipantAddressOkay}`))
  }

  replyToRequest(orders)({ orderId, participant }, isAccepted)

  beginSwap(app, order, (swap) => {
    const {
      buyAmount,
      buyCurrency,
      sellAmount,
      sellCurrency,
    } = swap

    orders.create({
      buyAmount,
      buyCurrency,
      sellAmount,
      sellCurrency,
    })
  })
}
