import SwapApp, { Events, util } from '../swap.app'
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
    this.buyAmount      = null // not same as in order - for each user own
    this.sellAmount     = null // not same as in order - for each user own

    this._persistState()

    this.flow = new Flow(this)
  }

  _persistState() {
    const order = SwapApp.env.storage.getItem(`swap.${this.id}`) || SwapApp.services.orders.getByKey(this.id)

    // if no `order` that means that participant is offline
    // TODO it's better to create swapCollection and store all swaps data there
    // TODO bcs if user offline and I'd like to continue Flow steps I don't need to w8 him
    // TODO so no need to get data from SwapOrders
    if (order) {
      const { isMy, buyAmount, sellAmount, buyCurrency, sellCurrency, ...rest } = util.pullProps(
        order,
        'isMy',
        'owner',
        'participant',
        'buyCurrency',
        'sellCurrency',
        'buyAmount',
        'sellAmount',
      )

      const data = {
        ...rest,
        isMy,
        buyAmount: isMy ? buyAmount : sellAmount,
        sellAmount: isMy ? sellAmount : buyAmount,
        sellCurrency: isMy ? sellCurrency : buyCurrency,
        buyCurrency: isMy ? buyCurrency : sellCurrency,
      }

      if (!data.participant && !isMy) {
        data.participant = data.owner
      }

      this.room = new Room({
        participantPeer: data.participant.peer,
      })

      this.update(data)
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

    console.log('New Swap state:', data)

    SwapApp.env.storage.setItem(`swap.${this.id}`, data)
  }

  update(values) {
    Object.keys(values).forEach((key) => {
      this[key] = values[key]
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
