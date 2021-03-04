'use strict'

const reverse = require('..')
const tap = require('tap')

tap.test('throws on unexpected eof in method', assert => {
  assert.throws(() => {
    reverse`GE`
  })
  assert.end()
})

tap.test('throws on unexpected eof in route', assert => {
  assert.throws(() => {
    reverse`GET /asdf`
  })

  assert.end()
})

tap.test('throws on unexpected eof in route w/comment', assert => {
  assert.throws(() => {
    reverse`GET /asdf # no way`
  })

  assert.end()
})

tap.test('throws on unexpected eof in target mode', assert => {
  assert.throws(() => {
    reverse`GET /asdf `
  })

  assert.end()
})

tap.test('throws on unexpected nl in method', assert => {
  assert.throws(() => {
    reverse`G
    ET / asdf`
  }, 'mid-method')
  assert.throws(() => {
    reverse`GET
    / asdf`
  }, 'right after method')
  assert.doesNotThrow(() => {
    reverse`

        GET /asdf womp
    `
  }, 'but not before method')
  assert.end()
})

tap.test('throws on unexpected nl in route', assert => {
  assert.throws(() => {
    reverse`GET
      /asdf`
  }, 'before-route')
  assert.throws(() => {
    reverse`GET /asdf
      /asdf`
  }, 'mid-route')
  assert.throws(() => {
    reverse`GET asdf${{boop: 12}}
      asdf
    `
  }, 'mid-route with interpolated value')
  assert.end()
})

tap.test('throws on param in method', assert => {
  assert.throws(() => {
    reverse`${{any: 'thing'}}GET /asdf anything`
  }, 'pre-method')
  assert.throws(() => {
    reverse`G${null}T /asdf anything`
  }, 'mid-method')
  assert.throws(() => {
    reverse`GET${true} /asdf anything`
  }, 'post-method')
  assert.end()
})

tap.test('throws on leading param in route', assert => {
  assert.throws(() => {
    reverse`GET ${assert}/asdf targ`
  }, 'pre-target')
  assert.end()
})

tap.test('throws on param in target', assert => {
  assert.throws(() => {
    reverse`GET /asdf ${assert}targ`
  }, 'pre-target')

  assert.throws(() => {
    reverse`GET /asdf bmar${assert}targ`
  }, 'mid-target')

  assert.throws(() => {
    reverse`GET /asdf zorg${assert}`
  }, 'post-target')
  assert.end()
})

const validMethods = ['*'].concat(require('http').METHODS)

tap.test(`accepts ${validMethods} as methods`, assert => {
  validMethods.forEach(xs => assert.doesNotThrow(
    () => reverse([`${xs} /test hello`]),
    `${xs} should not throw`
  ))
  assert.end()
})

tap.test('throws on unknown method', assert => {
  assert.throws(() => {
    reverse`GEM /asdf target`
  }, 'throws on GEM requests')
  assert.end()
})

tap.test('returns function', assert => {
  assert.equal(
    typeof reverse`GET /asdf target`,
    'function'
  )
  assert.end()
})

/* eslint-disable no-tabs */
tap.test('allows whitespace between method and route', assert => {
  assert.doesNotThrow(() => {
    reverse`GET   /asdf womp`
  }, 'multiple spaces are okay')
  assert.doesNotThrow(() => {
    reverse`GET	/asdf womp`
  }, 'tabs are okay')

  assert.end()
})

tap.test('allows whitespace between route and target', assert => {
  assert.doesNotThrow(() => {
    reverse`GET /asdf       womp`
  }, 'multiple spaces are okay')
  assert.doesNotThrow(() => {
    reverse`GET /asdf	womp`
  }, 'tabs are okay')

  assert.end()
})
/* eslint-enable no-tabs */

tap.test('we are okay with comments', assert => {
  assert.doesNotThrow(() => {
    reverse`
      # hello world
      GET /asdf       womp
      # things are okay
      POST /foo       bloo
      GET # intersperse
      /the # the
      thing # comment
      # YEP
    `
  }, 'comments throughout!')
  assert.doesNotThrow(() => {
    reverse`
      # hello world
    `
  }, 'just comments')
  assert.end()
})
