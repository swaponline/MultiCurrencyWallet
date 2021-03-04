const { Buffer } = require('buffer')
const { EventIterator } = require('event-iterator')

// copied from github.com/feross/buffer
// Some ArrayBuffers are not passing the instanceof check, so we need to do a bit more work :(
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

module.exports = socket => {
  const removeListener = socket.removeEventListener || socket.removeListener

  const source = (async function * () {
    const messages = new EventIterator(
      ({ push, stop, fail }) => {
        socket.addEventListener('message', push)
        socket.addEventListener('error', fail)
        socket.addEventListener('close', stop)

        return () => {
          removeListener.call(socket, 'message', push)
          removeListener.call(socket, 'error', fail)
          removeListener.call(socket, 'close', stop)
        }
      },
      { highWaterMark: Infinity }
    )

    for await (const { data } of messages) {
      yield isArrayBuffer(data) ? Buffer.from(data) : data
    }
  })()

  let connected = socket.readyState === 1
  let connError

  socket.addEventListener('open', () => {
    connected = true
    connError = null
  })

  socket.addEventListener('close', () => {
    connected = false
    connError = null
  })

  socket.addEventListener('error', err => {
    if (!connected) connError = err
  })

  source.connected = () => new Promise((resolve, reject) => {
    if (connected) return resolve()
    if (connError) return reject(connError)

    const cleanUp = cont => {
      removeListener.call(socket, 'open', onOpen)
      removeListener.call(socket, 'error', onError)
      cont()
    }

    const onOpen = () => cleanUp(resolve)
    const onError = err => cleanUp(() => reject(err))

    socket.addEventListener('open', onOpen)
    socket.addEventListener('error', onError)
  })

  return source
}
