const test = require('ava')
const pipe = require('it-pipe')
const pushable = require('.')

const collect = async source => {
  const input = []
  for await (const value of source) input.push(value)
  return input
}

test('should push input slowly', async t => {
  const source = pushable()
  const input = [1, 2, 3]
  for (let i = 0; i < input.length; i++) {
    setTimeout(() => source.push(input[i]), i * 10)
  }
  setTimeout(() => source.end(), input.length * 10)
  const output = await pipe(source, collect)
  t.deepEqual(output, input)
})

test('should buffer input', async t => {
  const source = pushable()
  const input = [1, 2, 3]
  input.forEach(v => source.push(v))
  setTimeout(() => source.end())
  const output = await pipe(source, collect)
  t.deepEqual(output, input)
})

test('should buffer some inputs', async t => {
  const source = pushable()
  const input = [1, [2.1, 2.2, 2.3], 3, 4, 5, [6.1, 6.2, 6.3, 6.4], 7]
  for (let i = 0; i < input.length; i++) {
    setTimeout(() => {
      if (Array.isArray(input[i])) {
        input[i].forEach(v => source.push(v))
      } else {
        source.push(input[i])
      }
    }, i * 10)
  }
  setTimeout(() => source.end(), input.length * 10)
  const output = await pipe(source, collect)
  t.deepEqual(output, [].concat.apply([], input))
})

test('should allow end before start', async t => {
  const source = pushable()
  const input = [1, 2, 3]
  input.forEach(v => source.push(v))
  source.end()
  const output = await pipe(source, collect)
  t.deepEqual(output, input)
})

test('should end with error immediately', async t => {
  const source = pushable()
  const input = [1, 2, 3]
  input.forEach(v => source.push(v))
  source.end(new Error('boom'))
  const err = await t.throwsAsync(pipe(source, collect))
  t.deepEqual(err.message, 'boom')
})

test('should end with error in the middle', async t => {
  const source = pushable()
  const input = [1, new Error('boom'), 3]
  for (let i = 0; i < input.length; i++) {
    setTimeout(() => {
      if (input[i] instanceof Error) {
        source.end(input[i])
      } else {
        source.push(input[i])
      }
    }, i * 10)
  }
  setTimeout(() => source.end(), input.length * 10)
  const err = await t.throwsAsync(pipe(source, collect))
  t.deepEqual(err.message, 'boom')
})

test('should allow end without push', async t => {
  const source = pushable()
  const input = []
  source.end()
  const output = await pipe(source, collect)
  t.deepEqual(output, input)
})

test('should allow next after end', async t => {
  const source = pushable()
  const input = [1]
  source.push(input[0])
  let next = await source.next()
  t.falsy(next.done)
  t.is(next.value, input[0])
  source.end()
  next = await source.next()
  t.true(next.done)
  next = await source.next()
  t.true(next.done)
})

test.cb('should call onEnd', t => {
  const source = pushable(() => t.end())
  const input = [1, 2, 3]
  for (let i = 0; i < input.length; i++) {
    setTimeout(() => source.push(input[i]), i * 10)
  }
  setTimeout(() => source.end(), input.length * 10)
  pipe(source, collect)
})

test.cb('should call onEnd if passed in options object', t => {
  const source = pushable({ onEnd: () => t.end() })
  const input = [1, 2, 3]
  for (let i = 0; i < input.length; i++) {
    setTimeout(() => source.push(input[i]), i * 10)
  }
  setTimeout(() => source.end(), input.length * 10)
  pipe(source, collect)
})

test.cb('should call onEnd even if not piped', t => {
  const source = pushable(() => t.end())
  source.end()
})

test.cb('should call onEnd with error', t => {
  const source = pushable(err => {
    t.is(err.message, 'boom')
    t.end()
  })
  setTimeout(() => source.end(new Error('boom')), 10)
  pipe(source, collect).catch(() => {})
})

test.cb('should call onEnd on return before end', t => {
  const input = [1, 2, 3, 4, 5]
  const max = 2
  const output = []

  const source = pushable(() => {
    t.deepEqual(output, input.slice(0, max))
    t.end()
  })

  input.forEach((v, i) => setTimeout(() => source.push(v), i * 10))
  setTimeout(() => source.end(), input.length * 10)

  ;(async () => {
    let i = 0
    for await (const value of source) {
      output.push(value)
      i++
      if (i === max) break
    }
  })()
})

test.cb('should call onEnd by calling return', t => {
  const input = [1, 2, 3, 4, 5]
  const max = 2
  const output = []

  const source = pushable(() => {
    t.deepEqual(output, input.slice(0, max))
    t.end()
  })

  input.forEach((v, i) => setTimeout(() => source.push(v), i * 10))
  setTimeout(() => source.end(), input.length * 10)

  ;(async () => {
    let i = 0
    while (i !== max) {
      i++
      const { value } = await source.next()
      output.push(value)
    }
    source.return()
  })()
})

test.cb('should call onEnd once', t => {
  const input = [1, 2, 3, 4, 5]

  let count = 0
  const source = pushable(() => {
    count++
    t.is(count, 1)
    setTimeout(() => t.end(), 50)
  })

  input.forEach((v, i) => setTimeout(() => source.push(v), i * 10))

  ;(async () => {
    await source.next()
    source.return()
    source.next()
  })()
})

test.cb('should call onEnd by calling throw', t => {
  const input = [1, 2, 3, 4, 5]
  const max = 2
  const output = []

  const source = pushable(err => {
    t.is(err.message, 'boom')
    t.deepEqual(output, input.slice(0, max))
    t.end()
  })

  input.forEach((v, i) => setTimeout(() => source.push(v), i * 10))
  setTimeout(() => source.end(), input.length * 10)

  ;(async () => {
    let i = 0
    while (i !== max) {
      i++
      const { value } = await source.next()
      output.push(value)
    }
    source.throw(new Error('boom'))
  })()
})

test('should support writev', async t => {
  const source = pushable({ writev: true })
  const input = [1, 2, 3]
  input.forEach(v => source.push(v))
  setTimeout(() => source.end())
  const output = await pipe(source, collect)
  t.deepEqual(output[0], input)
})

test('should always yield arrays when using writev', async t => {
  const source = pushable({ writev: true })
  const input = [1, 2, 3]
  setTimeout(() => {
    input.forEach(v => source.push(v))
    setTimeout(() => source.end())
  })
  const output = await pipe(source, collect)
  output.forEach(v => t.true(Array.isArray(v)))
})

test('should support writev and end with error', async t => {
  const source = pushable({ writev: true })
  const input = [1, 2, 3]
  input.forEach(v => source.push(v))
  source.end(new Error('boom'))
  const err = await t.throwsAsync(pipe(source, collect))
  t.deepEqual(err.message, 'boom')
})
