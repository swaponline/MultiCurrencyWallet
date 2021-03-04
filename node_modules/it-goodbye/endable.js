module.exports = goodbye => {
  const transform = source => (async function * () {
    for await (const val of source) yield val
    yield goodbye
    await ended // wait for repsonse
  })()

  const ended = new Promise(resolve => { transform.end = resolve })

  return transform
}
