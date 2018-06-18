import BigNumber from 'bignumber.js'
import SwapApp, { Events, util } from 'swap.app'
import Room from './Room'


class Swap {

  constructor(orderId, Flow) {
    this.events         = new Events()
    this.room           = null

    this.id             = orderId
    this.isMy           = null
    this.owner          = null
    this.participant    = null
    this.buyCurrency    = null
    this.sellCurrency   = null
    this.buyAmount      = null
    this.sellAmount     = null

    this._persistState()

    this.flow = new Flow(this)
  }

  _persistState() {
    let swap = SwapApp.env.storage.getItem(`swap.${this.id}`)

    // if no `order` that means that participant is offline
    // TODO it's better to create swapCollection and store all swaps data there
    // TODO bcs if user offline and I'd like to continue Flow steps I don't need to w8 him
    // TODO so no need to get data from SwapOrders
    if (!swap) {
      const order = SwapApp.services.orders.getByKey(this.id)

      if (order) {
        const { isMy, buyCurrency, sellCurrency, buyAmount, sellAmount, ...rest } = util.pullProps(
          order,
          'isMy',
          'owner',
          'participant',
          'buyCurrency',
          'sellCurrency',
          'buyAmount',
          'sellAmount',
        )

        swap = {
          ...rest,
          isMy,
          buyCurrency: isMy ? buyCurrency : sellCurrency,
          sellCurrency: isMy ? sellCurrency : buyCurrency,
          buyAmount: isMy ? buyAmount : sellAmount,
          sellAmount: isMy ? sellAmount : buyAmount,
        }

        if (!swap.participant && !isMy) {
          swap.participant = swap.owner
        }
      }
    }

    if (swap) {
      this.room = new Room({
        participantPeer: swap.participant.peer,
      })

      this.update(swap)
      this._saveState()
    }
  }

  _saveState() {
    const data = util.pullProps(
      this,
      'id',
      'isMy',
      'owner',
      'participant',
      'buyCurrency',
      'sellCurrency',
      'buyAmount',
      'sellAmount',
    )

    SwapApp.env.storage.setItem(`swap.${this.id}`, data)
  }

  update(values) {
    Object.keys(values).forEach((key) => {
      if (key === 'buyAmount' || key === 'sellAmount') {
        this[key] = new BigNumber(String(values[key]))
      }
      else {
        this[key] = values[key]
      }
    })
    this._saveState()
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }

  off(eventName, handler) {
    this.events.unsubscribe(eventName, handler)
  }
}


export default Swap
