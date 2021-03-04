const all = require('./')
const test = require('ava')

test('Should collect all entries of an async iterator as an array', async (t) => {
  const values = [0, 1, 2, 3, 4]

  const res = await all(values)

  t.deepEqual(res, values)
})
