module.exports = async socket => {
  // if the socket is closing or closed, return end
  if (socket.readyState >= 2) {
    throw new Error('socket closed')
  }

  // if open, return
  if (socket.readyState === 1) {
    return
  }

  return new Promise((resolve, reject) => {
    const remove = socket && (socket.removeEventListener || socket.removeListener)

    function cleanup () {
      if (typeof remove === 'function') {
        remove.call(socket, 'open', handleOpen)
        remove.call(socket, 'error', handleErr)
      }
    }

    function handleOpen () {
      cleanup(); resolve()
    }

    function handleErr (evt) {
      cleanup(); reject(evt)
    }

    socket.addEventListener('open', handleOpen)
    socket.addEventListener('error', handleErr)
  })
}
