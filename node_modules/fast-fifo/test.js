const tape = require('tape')
const FIFO = require('./')

tape('basic', function (t) {
  const q = new FIFO()
  const values = [
    1,
    4,
    4,
    0,
    null,
    {},
    Math.random(),
    '',
    'hello',
    9,
    1,
    4,
    5,
    6,
    7,
    null,
    null,
    0,
    0,
    15,
    52.2,
    null
  ]

  t.same(q.shift(), undefined)
  t.ok(q.isEmpty())
  for (const value of values) q.push(value)
  while (!q.isEmpty()) t.same(q.shift(), values.shift())
  t.same(q.shift(), undefined)
  t.ok(q.isEmpty())
  t.end()
})
