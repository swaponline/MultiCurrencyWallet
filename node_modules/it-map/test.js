const map = require('./')
const test = require('ava')

test('Should map an async iterator', async (t) => {
  const iter = function * () {
    yield 1
  }

  for await (const result of map(iter(), (val) => val + 1)) {
    t.is(result, 2)
  }
})

test('Should map an async iterator to a promise', async (t) => {
  const iter = function * () {
    yield 1
  }

  for await (const result of map(iter(), async (val) => val + 1)) {
    t.is(result, 2)
  }
})
