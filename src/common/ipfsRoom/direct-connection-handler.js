'use strict'

const EventEmitter = require('events')
const pipe = require('it-pipe')

const emitter = new EventEmitter()

function handler ({ connection, stream }) {
  console.log('direct-connection-handler', connection, stream)
  const peerId = connection.remotePeer.toB58String()

  pipe(
    stream,
    async function (source) {
      for await (const message of source) {
        console.log('direct connection handler', message)
        let msg

        try {
          msg = JSON.parse(message.toString())
        } catch (err) {
          console.log('dch - fail parse')
          emitter.emit('warning', err.message)
          continue // early
        }

        console.log('dch - parsed msg', msg)
        console.log('peerId', peerId, msg.from.id)
        if (peerId !== msg.from.id) {
          console.log('emit warning','no peerid match ' + msg.from)
          emitter.emit('warning', 'no peerid match ' + msg.from)
          continue // early
        }

        const topicIDs = msg.topicIDs
        if (!Array.isArray(topicIDs)) {
          console.log('emit warning', 'no topicIDs')
          emitter.emit('warning', 'no topic IDs')
          continue // early
        }

        msg.data = Buffer.from(msg.data, 'hex')
        msg.seqno = Buffer.from(msg.seqno, 'hex')

        console.log('parse msg', msg)
        topicIDs.forEach((topic) => {
          console.log('for topic', topic, msg)
          emitter.emit(topic, msg)
        })
      }
    }
  )
}

exports = module.exports = {
  handler: handler,
  emitter: emitter
}
