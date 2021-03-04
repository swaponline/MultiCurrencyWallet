const test = require('ava')
const all = require('it-all')
const glob = require('.')
const path = require('path')

test('it should match file', async t => {
  const files = await all(glob('.', '**/*'))

  t.truthy(files.includes('README.md'))
})

test('it should match file in subdirectory', async t => {
  const files = await all(glob('.', '**/*'))

  t.truthy(files.includes('node_modules/it-all'))
})

test('it should match one', async t => {
  const files = await all(glob('.', 'README.md'))

  t.deepEqual(files, ['README.md'])
})

test('it should match files', async t => {
  const files = await all(glob('README.md', 'README.md'))

  t.deepEqual(files, ['README.md'])
})

test('it should ignore files', async t => {
  const files = await all(glob('.', '**/*', {
    ignore: [
      '*/index.js',
      '**/node_modules/**'
    ]
  }))

  t.falsy(files.includes('test/index.js'))
})

test('it should ignore files from absolute directory', async t => {
  const files = await all(glob(__dirname, '**/*', {
    ignore: [
      'test/index.js',
      '**/node_modules/**'
    ]
  }))

  t.falsy(files.includes(path.resolve(__dirname, 'index.js')))
})

test('it returns absolute paths', async t => {
  const files = await all(glob(__dirname, '**/*', {
    absolute: true
  }))

  files.forEach(file => {
    t.truthy(file.startsWith('/'))
  })
})

test('it returns relative paths', async t => {
  const files = await all(glob(__dirname, '**/*', {
    absolute: false
  }))

  files.forEach(file => {
    t.falsy(file.startsWith('/'))
  })
})

test('it matches directories', async t => {
  const files = await all(glob(__dirname, 'node_modules/*'))

  t.truthy(files.includes('node_modules/it-all'))
})

test('it skips directories', async t => {
  const files = await all(glob(__dirname, 'node_modules/**/*', {
    nodir: true
  }))

  t.falsy(files.includes('node_modules/it-all'))
  t.truthy(files.includes('node_modules/it-all/package.json'))
})
