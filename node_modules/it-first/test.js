const first = require('./')
const test = require('ava')

test('Should return only the first result from an async iterator', async (t) => {
  const values = [0, 1, 2, 3, 4]

  const res = await first(values)

  t.is(res, 0)
})
