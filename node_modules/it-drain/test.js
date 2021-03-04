const drain = require('./')
const test = require('ava')

test('Should empty an async iterator', async (t) => {
  let done = false
  const iter = function * () {
    yield 1
    yield 2
    yield 3
    done = true
  }

  await drain(iter())

  t.truthy(done)
})
