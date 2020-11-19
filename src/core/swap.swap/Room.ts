import debug from 'debug'
import SwapApp, { Events } from 'swap.app'


class Room {

  swapId: string
  peer: any
  _events: any
  app: any

  // TODO add destroy method with all events unsubscribe (when swap is finished)

  constructor(app, { swapId, participantPeer }) {
    this.swapId           = swapId
    this.peer  = participantPeer
    this._events          = new Events()
    this.app              = null

    this._attachSwapApp(app)
  }

  _attachSwapApp(app) {
    SwapApp.required(app)

    this.app = app
  }

  getOnlineParticipant = () => {
    try {
      const online = this.app.services.room.connection.hasPeer(this.peer)

      if (!online) {
        this._events.dispatch('participant is offline', this.peer)
      }

      return online
    } catch (err) {
      console.warn(err)
      return false
    }
  }

  on(eventName, handler) {
    this.app.services.room.on(eventName, ({ fromPeer, swapId, ...values }) => {
      debug('swap.verbose:room')(`on ${eventName} from ${fromPeer} at swap ${swapId}`)
      if (fromPeer === this.peer && swapId === this.swapId) {
        handler(values)
      }
    })
  }

  once(eventName, handler) {
    const self = this

    this.app.services.room.on(eventName, function ({ fromPeer, swapId, ...values }) {
      debug('swap.verbose:room')(`once ${eventName} from ${fromPeer} at swap ${swapId}`)
      if (fromPeer === self.peer && swapId === self.swapId) {
        this.unsubscribe()
        handler(values)
      }
    })
  }

  sendMessage(message) {
    if (!this.getOnlineParticipant()) {
      setTimeout(() => {
        this.sendMessage(message)
      }, 3000)
    }

    const { event, data } = message

    this.app.services.room.sendConfirmation(this.peer, {
      event,
      action: 'active',
      data: {
        swapId: this.swapId,
        ...data,
      },
    })
  }
}


export default Room
