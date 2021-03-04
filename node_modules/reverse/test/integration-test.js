'use strict'

const reverse = require('..')
const tap = require('tap')

tap.test('match requires full route to be consumed', assert => {
  const router = reverse`
    GET /example greet
  `({
    greet () {
    }
  })

  // note the trailing slash!
  assert.equal(router.match('GET', '/example/'), null)
  assert.end()
})

tap.test('match requires method to match', assert => {
  const router = reverse`
    GET /example greet
  `({
    greet () {
    }
  })

  // note the request method!
  assert.equal(router.match('POST', '/example'), null)
  assert.end()
})

tap.test('match requires params to be validated', assert => {
  const id = reverse.param('id', /^\d+$/)
  const router = reverse`
    GET /example/${id} greet
  `({
  greet () {
  }
})

  // note the parameters ("hey", "hey-1", "1") — only "1" should pass!
  assert.equal(router.match('GET', '/example/hey'), null)
  assert.equal(router.match('GET', '/example/hey-1'), null)
  assert.ok(router.match('GET', '/example/1'))
  assert.end()
})

tap.test('match returns controller, method, and cooked params', assert => {
  const expected = (Math.random() * 10) | 0
  const id = reverse.param('id', function (value) {
    if (isNaN(value)) {
      throw new Error('failed')
    }
    return Number(value)
  })
  const controller = {
    greet () {
    }
  }
  const router = reverse`
    GET /example/${id} greet
  `(controller)

  const result = router.match('GET', `/example/${expected}`)
  assert.ok(result)
  assert.equal(result.target, controller.greet)
  assert.equal(result.controller, controller)
  assert.equal(result.context.get('id'), expected)
  assert.end()
})

tap.test('partial route match doesn\'t fail on unimplemented controller', assert => {
  const controller = {
    greet () {
    }
  }
  const router = reverse`
    GET /           hello
    GET /greetings  greet
  `(controller)

  const result = router.match('GET', `/greetings`)
  assert.ok(result)
  assert.equal(result.target, controller.greet)
  assert.equal(result.controller, controller)
  assert.end()
})

tap.test('match context unescapes input', assert => {
  const id = reverse.param('id', id => id)
  const controller = {
    greet () {
    }
  }
  const router = reverse`
    GET /example/${id} greet
  `(controller)

  const result = router.match('GET', `/example/%40hello%2fworld%2Fok`)
  assert.ok(result)
  assert.equal(result.target, controller.greet)
  assert.equal(result.controller, controller)
  assert.equal(result.context.get('id'), '@hello/world/ok')
  assert.end()
})

tap.test('match can include routes from other routers', assert => {
  const id = reverse.param('id', /^\d+$/)
  const routes = reverse`
    * /${id} target
  `
  const router = routes({
    target: routes({
      target: routes({
        target () {

        }
      })
    })
  })

  assert.ok(router.match('GET', '/1/2/3'))
  assert.end()
})

tap.test('match does not omit inner slashes between nested routers', assert => {
  const routes = reverse`
    * /a target
  `
  const router = routes({
    target: routes({
      target: routes({
        target () {

        }
      })
    })
  })

  assert.equal(router.match('GET', '/aaa'), null)
  assert.equal(router.match('GET', '/aa/a'), null)
  assert.equal(router.match('GET', '/a/aa'), null)
  assert.ok(router.match('GET', '/a/a/a'))
  assert.end()
})

tap.test('match collapses inner slashes', assert => {
  const routes = reverse`
    * / target
  `
  const router = routes({
    target: routes({
      target: routes({
        target () {

        }
      })
    })
  })
  assert.equal(router.match('GET', '////'), null)
  assert.equal(router.match('GET', '///'), null)
  assert.equal(router.match('GET', '//'), null)
  assert.ok(router.match('GET', '/'))
  assert.end()
})

tap.test('match will hit /-routes of included routers', assert => {
  const inner = reverse`GET / main`({main () {}})
  const routes = reverse`* /test inner`({inner})

  assert.ok(routes.match('GET', '/test'))
  assert.end()
})

tap.test('match allows routes to "fall through" included routers', assert => {
  const id = reverse.param('id', /^\d+$/)
  const slug = reverse.param('slug', /^[a-z_-]{1}[\w-]*$/)
  const expected = Math.random()
  const inner = 10 + Math.random()
  const routes = reverse`
    *     /blog           blogRoutes
    GET   /blog/${slug}   blogPost
  `({
  blogRoutes: reverse`
      POST /${id}          target
    `({target () { return inner }}),
  blogPost () {
    return expected
  }
})

  const match = routes.match('GET', '/blog/hey-there')
  assert.equal(
    match.target(),
    expected,
    'should have matched the appropriate route'
  )
  const match2 = routes.match('GET', '/blog/12')
  assert.equal(match2, null, 'mismatched methods')
  const match3 = routes.match('POST', '/blog/12')
  assert.equal(
    match3.target(),
    inner,
    'should have matched the appropriate inner route'
  )
  assert.end()
})

tap.test('reverse returns strings', assert => {
  const routes = reverse`
    GET /hello/world  greeting
    GET /good/bye     closing
  `({
    greeting () {},
    closing () {}
  })
  assert.equal(routes.reverse('greeting'), '/hello/world')
  assert.equal(routes.reverse('closing'), '/good/bye')
  assert.end()
})

tap.test('reverse interpolates values', assert => {
  const name = reverse.param('name', /^\w+$/)
  const id = reverse.param('id', /^\d+$/)
  const routes = reverse`
    GET /hello/${name}                greeting
    GET /good/bye/${name}/${id}       closing
  `({
  greeting () {},
  closing () {}
})

  assert.throws(() => {
    assert.equal(routes.reverse('greeting'), '/hello/world')
  })
  assert.equal(routes.reverse('greeting', {
    name: 'gary-busey'
  }), '/hello/gary-busey')
  assert.throws(() => {
    routes.reverse('closing', {
      name: 'gary-busey'
    })
  })
  assert.equal(routes.reverse('closing', {
    name: 'gary-busey',
    id: 10
  }), '/good/bye/gary-busey/10')
  assert.end()
})

tap.test('reverse matches included routes', assert => {
  const name = reverse.param('name', /^\w+$/)
  const id = reverse.param('id', /^\d+$/)
  const inner = reverse`
    GET /${id} getTarget
  `({getTarget () {}})
  const outer = reverse`
    GET /${name} inner
  `({inner})

  assert.equal(outer.reverse('inner.getTarget', {
    'name': 'hello',
    'inner.id': 10
  }), '/hello/10')

  assert.equal(outer.reverse('inner.getTarget', {
    'name': 'hello',
    'id': 10
  }), '/hello/10')
  assert.end()
})

tap.test('all provides info on all routes', assert => {
  const name = reverse.param('name', /^\w+$/)
  const id = reverse.param('id', /^\d+$/)
  const inner = reverse`
    GET /goof  dne
    GET /${id} getTarget
  `({getTarget () {}})
  const outer = reverse`
    GET /flub/${name} fn
    GET /${name} inner
  `({inner, flub () {}})
  const results = Array.from(outer.all())
  assert.deepEqual(results.map(xs => xs.name), [
    'fn',
    'inner.dne',
    'inner.getTarget'
  ])
  assert.deepEqual(results.map(xs => xs.route), [
    '/flub/:name',
    '/:name/goof',
    '/:name/:id'
  ])

  assert.end()
})

tap.test('reverse escapes params', assert => {
  const name = reverse.param('name', /^\w+$/)
  const router = reverse`
    GET /${name} main
  `({main () {}})

  assert.equal(
    router.reverse('main', {name: '@hello/world'}),
    '/%40hello%2Fworld'
  )

  assert.equal(
    router.reverse('main', {name: '@hello/world'}, true),
    '/@hello/world'
  )
  assert.end()
})

tap.test('match param with multiple capture group regex', assert => {
  const abc = reverse.param('abc', id => id, '(([^b]+)(b(\\w+))?)')
  const id = reverse.param('id', id => id)
  const router = reverse`
    GET /${abc}${id} target
  `({target () {}})

  const result = router.match('GET', `/abc102`)
  assert.equal(result.context.get('abc'), 'abc10')
  assert.equal(result.context.get('id'), '2')
  assert.end()
})

tap.test('match param with non-capturing group regex', assert => {
  const abc = reverse.param('abc', id => id, '(([^b]+)(b(?:\\w+))?)')
  const id = reverse.param('id', id => id)
  const router = reverse`
    GET /${abc}${id} target
  `({target () {}})

  const result = router.match('GET', `/abc102`)
  assert.equal(result.context.get('abc'), 'abc10')
  assert.equal(result.context.get('id'), '2')
  assert.end()
})

tap.test('match param with lookahead group regex', assert => {
  const abc = reverse.param('abc', id => id, '(([^b]+)(b(?=\\w+))?)')
  const id = reverse.param('id', id => id)
  const router = reverse`
    GET /${abc}${id} target
  `({target () {}})

  const result = router.match('GET', `/abc102`)
  assert.equal(result.context.get('abc'), 'ab')
  assert.equal(result.context.get('id'), 'c102')
  assert.end()
})

tap.test('match param with negated lookahead group regex', assert => {
  const abc = reverse.param('abc', id => id, '(([^b]+)(b(?!goof))?)')
  const id = reverse.param('id', id => id)
  const router = reverse`
    GET /${abc}${id} target
  `({target () {}})

  const result = router.match('GET', `/abc102`)
  assert.equal(result.context.get('abc'), 'ab')
  assert.equal(result.context.get('id'), 'c102')
  assert.end()
})

tap.test('concatenating routers works as expected', assert => {
  const lhs = reverse`
    GET /hello foo
  `({
    foo () {
      return 1
    }
  })
  const rhs = reverse`
    GET /hello/world bar
  `({
    bar () {
      return 2
    }
  })

  const routes = lhs.concat(rhs)

  const hitsRHS = routes.match('GET', '/hello/world')
  assert.equal(hitsRHS.target(), 2)

  const hitsLHS = routes.match('GET', '/hello')
  assert.equal(hitsLHS.target(), 1)

  assert.end()
})

tap.test('concatenating routers fails on shared targets', assert => {
  const lhs = reverse`
    GET /hello foo
    POST /bloo blah
    GET / gnarly
  `({
    foo () {
      return 1
    }
  })
  const rhs = reverse`
    GET /hello/world foo
    HEAD / gnarly
  `({
    bar () {
      return 2
    }
  })

  assert.throws(() => {
    lhs.concat(rhs)
  })
  try {
    lhs.concat(rhs)
  } catch (err) {
    assert.equal(err.message, 'cannot ".concat" routers due to shared targets: "foo", "gnarly"')
  }
  assert.end()
})

tap.test('normalizes non-reserved path characters', assert => {
  const router = reverse`
    GET /~ greet
  `({
    greet () {
    }
  })

  // note the trailing slash!
  const result = router.match('GET', '/%7E')
  assert.ok(result.context, 'Making sure that the result exists')
  assert.end()
})
