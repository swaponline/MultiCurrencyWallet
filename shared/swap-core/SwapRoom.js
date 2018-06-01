import room from './room'


class SwapRoom {

  constructor({ swapId, participantPeer }) {
    this.swapId = swapId
    this.peer = participantPeer
  }

  subscribe(eventName, handler) {
    room.events.subscribe(eventName, ({ fromPeer, swapId, ...values }) => {
      if (fromPeer === this.peer && swapId === this.swapId) {
        handler(values)
      }
    })
  }

  once(eventName, handler) {
    const self = this

    room.events.subscribe(eventName, function ({ fromPeer, swapId, ...values }) {
      if (fromPeer === self.peer && swapId === self.swapId) {
        console.error(`INCOME SwapRoom event "${eventName}"`)

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
        console.error(`OUTCOME SwapRoom event "${value}"`)

        room.connection.sendTo(this.peer, JSON.stringify([
          {
            event: value,
            swapId: this.swapId,
          }
        ]))
      }
      // value - messages
      else if (Array.isArray(value)) {
        value.forEach(({ event }) => {
          console.log(`OUTCOME SwapRoom event "${event}"`)
        })

        room.connection.sendTo(this.peer, JSON.stringify(value))
      }
    }
    else {
      const [ eventName, message ] = args

      console.log(`OUTCOME SwapRoom event "${eventName}"`)

      room.connection.sendTo(this.peer, JSON.stringify([
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


export default SwapRoom
