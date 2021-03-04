var pipe = require('it-pipe')
var pair = require('../')
var Duplex = require('../duplex')
var tape = require('tape')

tape('simple', async function (t) {
  var p = pair()
  var input = [1, 2, 3]
  pipe(input, p.sink)
  const values = await pipe(p.source, collect)
  console.log(values) // [1, 2, 3]
  t.deepEqual(values, input)
  t.end()
})

tape('simple - error', async function (t) {
  var p = pair()
  var err = new Error('test errors')
  pipe({ [Symbol.iterator]: async function * () { throw err } }, p.sink)
  try {
    await pipe(p.source, collect)
  } catch (_err) {
    console.log(_err)
    t.equal(_err, err)
    t.end()
  }
})

tape('echo duplex', function (t) {
  var d = Duplex()
  pipe(
    [1, 2, 3],
    d[0],
    collect
  ).then(ary => {
    t.deepEqual(ary, [1, 2, 3])
    t.end()
  })

  // pipe the second duplex stream back to itself.
  pipe(d[1], through(console.log), d[1])
})

function through (fn) {
  return async function * (source) {
    for await (const value of source) {
      fn(value)
      yield value
    }
  }
}

async function collect (source) {
  const values = []
  for await (const value of source) {
    values.push(value)
  }
  return values
}
