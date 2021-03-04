const Fifo = require('fast-fifo')
const defer = require('p-defer')

module.exports = class PFifo {
  constructor () {
    this._buffer = new Fifo()
    this._waitingConsumers = new Fifo()
  }

  push (chunk) {
    const { promise, resolve } = defer()
    this._buffer.push({ chunk, resolve })
    this._consume()
    return promise
  }

  _consume () {
    while (!this._waitingConsumers.isEmpty() && !this._buffer.isEmpty()) {
      const nextConsumer = this._waitingConsumers.shift()
      const nextChunk = this._buffer.shift()
      nextConsumer.resolve(nextChunk.chunk)
      nextChunk.resolve()
    }
  }

  shift () {
    const { promise, resolve } = defer()
    this._waitingConsumers.push({ resolve })
    this._consume()
    return promise
  }

  isEmpty () {
    return this._buffer.isEmpty()
  }
}
