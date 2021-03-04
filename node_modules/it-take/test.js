const take = require('./')
const all = require('it-all')
const test = require('ava')

test('Should limit the number of values returned from an iterable', async (t) => {
  const values = [0, 1, 2, 3, 4]

  const res = await all(take(values, 2))

  t.deepEqual(res, [0, 1])
})
