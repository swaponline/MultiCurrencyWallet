import Events from './Events'
import orderCollection from './orderCollection'
import { localStorage, pullProps } from './util'


class Swap {

  constructor({ orderId }) {
    this.events         = new Events()
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

      this.update(data)
      localStorage.setItem(`swap.${this.id}`, data)
    }
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
  }

  on(eventName, handler) {
    this.events.subscribe(eventName, handler)
  }

  off(eventName, handler) {
    this.events.unsubscribe(eventName, handler)
  }
}


export default Swap
