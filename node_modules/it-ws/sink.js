const ready = require('./ready')

module.exports = (socket, options) => {
  options = options || {}
  options.closeOnEnd = options.closeOnEnd !== false

  return async source => {
    for await (const data of source) {
      try {
        await ready(socket)
      } catch (err) {
        if (err.message === 'socket closed') break
        throw err
      }

      socket.send(data)
    }

    if (options.closeOnEnd && socket.readyState <= 1) {
      return new Promise((resolve, reject) => {
        socket.addEventListener('close', event => {
          if (event.wasClean || event.code === 1006) {
            resolve()
          } else {
            const err = Object.assign(new Error('ws error'), { event })
            reject(err)
          }
        })

        setTimeout(() => socket.close())
      })
    }
  }
}
