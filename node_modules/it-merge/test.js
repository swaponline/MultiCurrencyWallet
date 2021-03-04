const merge = require('./')
const all = require('it-all')
const test = require('ava')

test('Should merge multiple arrays', async (t) => {
  const values1 = [0, 1, 2, 3, 4]
  const values2 = [5, 6, 7, 8, 9]

  const res = await all(merge(values1, values2))

  t.deepEqual(res.sort(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
})
