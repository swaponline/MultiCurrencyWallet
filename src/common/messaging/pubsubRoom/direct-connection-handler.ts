'use strict'
import debug from 'debug'
import EventEmitter from 'events'
import pipe from 'it-pipe'

const emitter = new EventEmitter()

function handler ({ connection, stream }) {
  const peerId = connection.remotePeer.toB58String()

  pipe(
    stream,
    async function (source) {
      for await (const message of source) {
        let msg

        try {
          msg = JSON.parse(message.toString())
        } catch (err) {
          emitter.emit('warning', err.message)
          continue // early
        }

        if (peerId !== msg.from.id) {
          emitter.emit('warning', 'no peerid match ' + msg.from)
          continue // early
        }

        const topicIDs = msg.topicIDs
        if (!Array.isArray(topicIDs)) {
          emitter.emit('warning', 'no topic IDs')
          continue // early
        }

        msg.data = Buffer.from(msg.data, 'hex')
        msg.seqno = Buffer.from(msg.seqno, 'hex')

        topicIDs.forEach((topic) => {
          emitter.emit(topic, msg)
        })
      }
    }
  )
}

export default {
  handler: handler,
  emitter: emitter
}
