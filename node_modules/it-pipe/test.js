import test from 'ava'
import pipe from '.'

const oneTwoThree = () => [1, 2, 3]

const collect = async (source) => {
  const vals = []
  for await (const val of source) vals.push(val)
  return vals
}

test('should pipe source', async t => {
  const result = await pipe(oneTwoThree)
  t.deepEqual(result, [1, 2, 3])
})

test('should pipe source -> sink', async t => {
  const result = await pipe(oneTwoThree, collect)
  t.deepEqual(result, [1, 2, 3])
})

test('should pipe source -> transform -> sink', async t => {
  const result = await pipe(
    oneTwoThree,
    function transform (source) {
      return (async function * () { // A generator is async iterable
        for await (const val of source) yield val * 2
      })()
    },
    collect
  )

  t.deepEqual(result, [2, 4, 6])
})

test('should allow iterable first param', async t => {
  const result = await pipe(oneTwoThree(), collect)
  t.deepEqual(result, [1, 2, 3])
})

test('should allow duplex at start', async t => {
  const duplex = {
    sink: collect,
    source: oneTwoThree()
  }

  const result = await pipe(duplex, collect)
  t.deepEqual(result, [1, 2, 3])
})

test('should allow duplex at end', async t => {
  const duplex = {
    sink: collect,
    source: oneTwoThree()
  }

  const result = await pipe(oneTwoThree, duplex)
  t.deepEqual(result, [1, 2, 3])
})

test('should allow duplex in the middle', async t => {
  const duplex = {
    sink: source => { duplex.source = source },
    source: { [Symbol.asyncIterator] () {} }
  }

  const result = await pipe(oneTwoThree, duplex, collect)
  t.deepEqual(result, [1, 2, 3])
})
