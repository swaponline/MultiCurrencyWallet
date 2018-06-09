import SwapApp from '../swap.app'


class Room {

  constructor({ swapId, participantPeer }) {
    this.swapId = swapId
    this.peer = participantPeer
  }

  subscribe(eventName, handler) {
    SwapApp.services.room.events.subscribe(eventName, ({ fromPeer, swapId, ...values }) => {
      if (fromPeer === this.peer && swapId === this.swapId) {
        handler(values)
      }
    })
  }

  once(eventName, handler) {
    const self = this

    SwapApp.services.room.events.subscribe(eventName, function ({ fromPeer, swapId, ...values }) {
      if (fromPeer === self.peer && swapId === self.swapId) {
        console.error(`INCOME SwapSwapApp.services.room event "${eventName}"`)

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
        console.error(`OUTCOME SwapSwapApp.services.room event "${value}"`)

        SwapApp.services.room.connection.sendTo(this.peer, JSON.stringify([
          {
            event: value,
            swapId: this.swapId,
          }
        ]))
      }
      // value - messages
      else if (Array.isArray(value)) {
        value.forEach(({ event }) => {
          console.log(`OUTCOME SwapSwapApp.services.room event "${event}"`)
        })

        SwapApp.services.room.connection.sendTo(this.peer, JSON.stringify(value))
      }
    }
    else {
      const [ eventName, message ] = args

      console.log(`OUTCOME SwapSwapApp.services.room event "${eventName}"`)

      SwapApp.services.room.connection.sendTo(this.peer, JSON.stringify([
        {
          event: eventName,
          data: {
            swapId: this.swapId,
            ...message,
          },
        }
      ]))
    }
  }
}


export default Room
