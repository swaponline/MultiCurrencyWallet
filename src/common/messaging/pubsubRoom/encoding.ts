'use strict'

export default (_message) => {
  let message = _message
  if (!Buffer.isBuffer(message)) {
    message = Buffer.from(message)
  }
  return message
}
