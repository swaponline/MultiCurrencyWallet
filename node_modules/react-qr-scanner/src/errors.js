function NoVideoInputDevicesError() {
  const err = new Error()
  err.name = 'NoVideoInputDevicesError'
  err.message = 'No video input devices found'
}
NoVideoInputDevicesError.prototype = new Error()

export {
  NoVideoInputDevicesError,
}