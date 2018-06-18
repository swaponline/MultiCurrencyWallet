import SwapApp from 'swap.app'


class Room {

  // TODO add destroy method with all events unsubscribe (when swap is finished)

  constructor({ swapId, participantPeer }) {
    this.swapId = swapId
    this.peer = participantPeer
  }

  subscribe(eventName, handler) {
    SwapApp.services.room.subscribe(eventName, ({ fromPeer, swapId, ...values }) => {
      if (fromPeer === this.peer && swapId === this.swapId) {
        handler(values)
      }
    })
  }

  once(eventName, handler) {
    const self = this

    SwapApp.services.room.subscribe(eventName, function ({ fromPeer, swapId, ...values }) {
      if (fromPeer === self.peer && swapId === self.swapId) {
        this.unsubscribe()
        handler(values)
      }
    })
  }

  sendMessage(...args) {
    if (args.length === 1) {
      const [ value ] = args

      // value - eventName
      if (typeof value === 'string') {
        SwapApp.services.room.sendMessage(this.peer, [
          {
            event: value,
            swapId: this.swapId,
          },
        ])
      }
      // value - messages
      else if (Array.isArray(value)) {
        SwapApp.services.room.sendMessage(this.peer, value)
      }
    }
    else {
      const [ eventName, message ] = args

      SwapApp.services.room.sendMessage(this.peer, [
        {
          event: eventName,
          data: {
            swapId: this.swapId,
            ...message,
          },
        },
      ])
    }
  }
}


export default Room
