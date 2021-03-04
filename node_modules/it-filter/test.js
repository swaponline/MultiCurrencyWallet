const all = require('it-all')
const filter = require('./')
const test = require('ava')

test('Should filter all values greater than 2', async (t) => {
  const values = [0, 1, 2, 3, 4]

  const res = await all(filter(values, val => val > 2))

  t.deepEqual(res, [3, 4])
})

test('Should filter all values greater than 2 with a promise', async (t) => {
  const values = [0, 1, 2, 3, 4]

  const res = await all(filter(values, async val => val > 2))

  t.deepEqual(res, [3, 4])
})
