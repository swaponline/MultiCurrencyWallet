const FIFO = require('fast-fifo')

module.exports = (options) => {
  options = options || {}
  let onEnd

  if (typeof options === 'function') {
    onEnd = options
    options = {}
  } else {
    onEnd = options.onEnd
  }

  let buffer = new FIFO()
  let pushable, onNext, ended

  const waitNext = () => {
    if (!buffer.isEmpty()) {
      if (options.writev) {
        let next
        const values = []
        while (!buffer.isEmpty()) {
          next = buffer.shift()
          if (next.error) throw next.error
          values.push(next.value)
        }
        return { done: next.done, value: values }
      }

      const next = buffer.shift()
      if (next.error) throw next.error
      return next
    }

    if (ended) return { done: true }

    return new Promise((resolve, reject) => {
      onNext = next => {
        onNext = null
        if (next.error) {
          reject(next.error)
        } else {
          if (options.writev && !next.done) {
            resolve({ done: next.done, value: [next.value] })
          } else {
            resolve(next)
          }
        }
        return pushable
      }
    })
  }

  const bufferNext = next => {
    if (onNext) return onNext(next)
    buffer.push(next)
    return pushable
  }

  const bufferError = err => {
    buffer = new FIFO()
    if (onNext) return onNext({ error: err })
    buffer.push({ error: err })
    return pushable
  }

  const push = value => {
    if (ended) return pushable
    return bufferNext({ done: false, value })
  }
  const end = err => {
    if (ended) return pushable
    ended = true
    return err ? bufferError(err) : bufferNext({ done: true })
  }
  const _return = () => {
    buffer = new FIFO()
    end()
    return { done: true }
  }
  const _throw = err => {
    end(err)
    return { done: true }
  }

  pushable = {
    [Symbol.asyncIterator] () { return this },
    next: waitNext,
    return: _return,
    throw: _throw,
    push,
    end
  }

  if (!onEnd) return pushable

  const _pushable = pushable

  pushable = {
    [Symbol.asyncIterator] () { return this },
    next () {
      return _pushable.next()
    },
    throw (err) {
      _pushable.throw(err)
      if (onEnd) {
        onEnd(err)
        onEnd = null
      }
      return { done: true }
    },
    return () {
      _pushable.return()
      if (onEnd) {
        onEnd()
        onEnd = null
      }
      return { done: true }
    },
    push,
    end (err) {
      _pushable.end(err)
      if (onEnd) {
        onEnd(err)
        onEnd = null
      }
      return pushable
    }
  }

  return pushable
}
