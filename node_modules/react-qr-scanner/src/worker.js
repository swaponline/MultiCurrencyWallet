// jsQR is concatenated by gulp

self.addEventListener('message', function (e) {
  // eslint-disable-next-line no-undef
  const decoded = jsQR(
    e.data.data,
    e.data.width,
    e.data.height
  )
  postMessage(decoded)
})
