
var tape = require('tape')
const { pipeline, filter, collect } = require('streaming-iterables')
var endable = require('../endable')

tape('simple', async function (t) {
  t.plan(2)

  var e1 = endable(-1)
  var e2 = endable(-1)

  const [ ary0, ary1 ] = await Promise.all([
    pipeline(
      () => [1, 2, 3],
      e1,
      filter(function (n) {
        if (n !== -1) return true
        e2.end()
      }),
      collect
    ),
    pipeline(
      () => [1, 2, 3],
      e2,
      filter(function (n) {
        if (n !== -1) return true
        e1.end()
      }),
      collect
    )
  ])

  t.deepEqual(ary0, [1, 2, 3])
  t.deepEqual(ary1, [1, 2, 3])
})
