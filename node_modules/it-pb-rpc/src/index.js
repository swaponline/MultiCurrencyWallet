'use strict'

const isBuffer = require('is-buffer')
const Shake = require('it-handshake')
const lp = require('it-length-prefixed')

module.exports = (duplex, opts = {}) => {
  const shake = Shake(duplex)
  const lpReader = lp.decode.fromReader(
      shake.reader,
      opts
  )

  let isDone = false

  const W = {
    read: async (bytes) => {
      // just read

      const { value, done } = await shake.reader.next(bytes)

      if (done && value.length < bytes) {
        throw new Error('Couldn\'t read enough bytes')
      }

      isDone = done

      if (!value) { throw new Error('Value is null') }
      return value
    },
    readLP: async () => {
      // read, decode
      const { value, done } = await lpReader.next()

      isDone = done

      if (!value) { throw new Error('Value is null') }
      return value
    },
    readPB: async (proto) => {
      // readLP, decode
      const value = await W.readLP()

      if (!value) { throw new Error('Value is null') }

      // Is this a buffer?
      const buf = isBuffer(value) ? value : value.slice()

      return proto.decode(buf)
    },
    write: (data) => {
      // just write
      shake.writer.push(data)
    },
    writeLP: (data) => {
      // encode, write
      W.write(lp.encode.single(data, opts))
    },
    writePB: (data, proto) => {
      // encode, writeLP
      W.writeLP(proto.encode(data))
    },

    pb: (proto) => {
      return {
        read: () => W.readPB(proto),
        write: (d) => W.writePB(d, proto)
      }
    },

    unwrap: () => {
      // returns vanilla duplex again, terminates all reads/writes from this object
      shake.rest()
      return shake.stream
    }
  }

  return W
}
