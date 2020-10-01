import debug from 'debug'
import BigNumber from 'bignumber.js'
import SwapApp, { Events, util,  } from 'swap.app'
import Room from './Room'


class Swap {

  constructor(id, app, order) {
    this.id                     = null
    this.isMy                   = null
    this.owner                  = null
    this.participant            = null
    this.buyCurrency            = null
    this.sellCurrency           = null
    this.buyAmount              = null
    this.sellAmount             = null
    this.ownerSwap              = null
    this.participantSwap        = null
    this.destinationBuyAddress  = null
    this.destinationSellAddress = null
    this.app                    = null
    this.createUnixTimeStamp    = Math.floor(new Date().getTime() / 1000)

    this.participantMetamaskAddress = null

    // Wait confirm > 1
    this.waitConfirm            = false

    this._attachSwapApp(app)

    let data = this.app.env.storage.getItem(`swap.${id}`)

    if (!data) {
      order = order || this.app.services.orders.getByKey(id)

      data = this._getDataFromOrder(order)
    }

    this.update(data)

    this.events = new Events()

    this.room = new Room(app, {
      swapId: id,
      participantPeer: this.participant.peer,
    })

    this.ownerSwap        = this.app.swaps[data.buyCurrency.toUpperCase()]
    this.participantSwap  = this.app.swaps[data.sellCurrency.toUpperCase()]

    const Flow = this.app.flows[`${data.sellCurrency.toUpperCase()}2${data.buyCurrency.toUpperCase()}`]

    if (!Flow) {
      throw new Error(`Flow with name "${data.sellCurrency.toUpperCase()}2${data.buyCurrency.toUpperCase()}" not found in SwapApp.flows`)
    }

    this.flow = new Flow(this)

    // Change destination address on run time
    this.room.on('set destination buy address', (data) => {
      debug('swap.core:swap')("Other side change destination buy address", data);
      this.update({
        destinationSellAddress: data.address
      })
    });
    this.room.on('set destination sell address', (data) => {
      debug('swap.core:swap')("Other side change destination sell address", data);
      this.update({
        destinationBuyAddress: data.address
      })
    });

    this.room.on('set metamask address', (data) => {
      debug('swap.core:swap')('Participant use metamask')
      this.update({
        participantMetamaskAddress: data.address,
      })
    })
  }

  static read(app, { id } = {}) {
    SwapApp.required(app)

    if (!id) {
      debug('swap.core:swap')(`SwapReadError: id not given: ${id}`)
      return {}
    }

    const data = app.env.storage.getItem(`swap.${id}`)

    if (!data) {
      debug('swap.core:swap')(`SwapReadError: No swap with id=${id}`)
      return {}
    }

    const Flow = app.flows[`${data.sellCurrency.toUpperCase()}2${data.buyCurrency.toUpperCase()}`]

    if (!Flow) {
      throw new Error(`Flow with name "${data.sellCurrency.toUpperCase()}2${data.buyCurrency.toUpperCase()}" not found in SwapApp.flows`)
    }

    data.flow = Flow.read(app, data)

    return data
  }

  _attachSwapApp(app) {
    SwapApp.required(app)

    this.app = app
  }

  _getDataFromOrder(order) {
    // TODO add check order format (typeforce)

    const data = util.pullProps(
      order,
      'id',
      'isMy',
      'owner',
      'participant',
      'sellCurrency',
      'sellAmount',
      'buyCurrency',
      'buyAmount',
      'destination',
    )

    const {
      isMy,
      sellCurrency,
      sellAmount,
      buyCurrency,
      buyAmount,
      destination,
      ...rest
    } = data

    const { ownerAddress, participantAddress } = destination

    const swap = {
      ...rest,
      isMy,
      sellCurrency: isMy ? sellCurrency : buyCurrency,
      sellAmount: isMy ? sellAmount : buyAmount,
      buyCurrency: isMy ? buyCurrency : sellCurrency,
      buyAmount: isMy ? buyAmount : sellAmount,
      destinationBuyAddress: isMy ? ownerAddress : participantAddress,
      destinationSellAddress: isMy ? participantAddress : ownerAddress,
    }

    if (!swap.participant && !isMy) {
      swap.participant = swap.owner
    }

    return swap
  }

  _pullRequiredData(data) {
    return util.pullProps(
      data,
      'id',
      'isMy',
      'owner',
      'participant',
      'sellCurrency',
      'sellAmount',
      'buyCurrency',
      'buyAmount',
      'destinationBuyAddress',
      'destinationSellAddress',
      'createUnixTimeStamp',
      'participantMetamaskAddress',
      'waitConfirm',
    )
  }

  _saveState() {
    const data = this._pullRequiredData(this)

    this.app.env.storage.setItem(`swap.${this.id}`, data)
  }

  checkTimeout(timeoutUTS) {
    // return true if timeout passed
    return !((this.createUnixTimeStamp + timeoutUTS) > Math.floor(new Date().getTime() / 1000))
  }

  needWaitConfirm() {
    this.update({
      waitConfirm: true,
    })
  }

  processMetamask() {
    if (this.app.env.metamask
      && this.app.env.metamask.isEnabled()
      && this.app.env.metamask.isConnected()
    ) {
      this.room.sendMessage({
        event: 'set metamask address',
        data: {
          address: this.app.env.metamask.getAddress(),
        },
      })
    }
  }

  setDestinationBuyAddress(address) {
    this.update({
      destinationBuyAddress: address
    });

    this.room.sendMessage({
      event: 'set destination buy address',
      data: {
        address: address
      }
    });
  }

  setDestinationSellAddress(address) {
    this.update({
      destinationSellAddress: address
    });

    this.room.sendMessage({
      event: 'set destination sell address',
      data: {
        address: address
      }
    });
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
