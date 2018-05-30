import Events from './Events'
import SwapRoom from './SwapRoom'
import orderCollection from './orderCollection'
import { localStorage, pullProps } from './util'


class Swap {

  constructor({ orderId }) {
    this.events         = new Events()
    this.room           = null
    this.flow           = null

    this.id             = orderId
    this.isMy           = null
    this.owner          = null
    this.participant    = null
    this.buyCurrency    = null
    this.sellCurrency   = null
    this.buyAmount      = null // not same as in order - for each user own
    this.sellAmount     = null // not same as in order - for each user own

    this._persistState()
  }

  _persistState() {
    const order = localStorage.getItem(`swap.${this.id}`) || orderCollection.getByKey(this.id)

    // if no `order` that means that participant is offline
    // TODO it's better to create swapCollection and store all swaps data there
    // TODO bcs if user offline and I'd like to continue Flow steps I don't need to w8 him
    // TODO so no need to get data from orderCollection
    if (order) {
      const { isMy, buyAmount, sellAmount, ...rest } = pullProps(
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
      }

      if (!data.participant && !isMy) {
        data.participant = data.owner
      }

      this.room = new SwapRoom({
        participantPeer: data.participant.peer,
      })

      this.update(data)
      this._saveState()
    }
  }

  _saveState() {
    const data = pullProps(
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

    localStorage.setItem(`swap.${this.id}`, data)
  }

  setFlow(Flow, options) {
    this.flow = new Flow({
      swap: this,
      options,
    })

    return this.flow
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
