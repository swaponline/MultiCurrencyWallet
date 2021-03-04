'use strict'

module.exports = router

const http = require('http')

const Router = require('./router.js')
const Target = require('./target.js')
const param = require('./param.js')

const METHODS = new Set(['*'].concat(http.METHODS))

router.param = param

function router (bits) {
  const rest = [].slice.call(arguments, 1)
  bits.map(xs => xs.split(''))
  var out = bits[0].split('')
  for (var i = 1; i < bits.length; ++i) {
    out.push(rest.shift())
    out = out.concat(bits[i].split(''))
  }

  var stateMachine = _methodMachine
  var accMethod = []
  var accRoute = []
  var accTarget = []
  var routes = []
  for (var c = 0; c < out.length; ++c) {
    if (out[c] === '#') {
      for (; c < out.length; ++c) {
        if (out[c] === '\n') {
          break
        }
      }
    } else {
      stateMachine = stateMachine(
        out[c],
        accMethod,
        accRoute,
        accTarget,
        routes
      )
    }
  }
  stateMachine = stateMachine('\n', accMethod, accRoute, accTarget, routes)

  if (stateMachine !== _methodMachine ||
      accMethod.length > 0) {
    throw new Error('unexpected end of router specification')
  }

  return controller => new Router(controller, routes.slice())
}

function _methodMachine (ch, method, route, target, store) {
  if (typeof ch !== 'string') {
    throw new Error('expected string in this position')
  }
  if (!method.length) {
    if (ws(ch) || nl(ch)) {
      return _methodMachine
    }
  }
  if (ws(ch)) {
    if (!METHODS.has(method.join(''))) {
      throw new Error(
        'expected valid HTTP method or * — got ' + method.join('')
      )
    }
    return _routeMachine
  }
  if (nl(ch)) {
    throw new Error('unexpected newline')
  }
  method.push(ch)
  return _methodMachine
}

function _routeMachine (ch, method, route, target, store) {
  if (!route.length) {
    if (typeof ch !== 'string') {
      throw new Error('expected string in this position')
    }
    if (ws(ch) || nl(ch)) {
      return _routeMachine
    }
  }
  if (ws(ch)) {
    return _targetMachine
  }
  if (nl(ch)) {
    throw new Error('unexpected newline')
  }
  route.push(ch)
  return _routeMachine
}

function _targetMachine (ch, method, route, target, store) {
  if (typeof ch !== 'string') {
    throw new Error('expected string in this position')
  }
  if (!target.length) {
    if (ws(ch) || nl(ch)) {
      return _targetMachine
    }
  }
  if (ws(ch) || nl(ch)) {
    store.push(new Target(
      method.join(''),
      route.slice(),
      target.join('')
    ))
    method.length = route.length = target.length = 0
    return _methodMachine
  }
  target.push(ch)
  return _targetMachine
}

function ws (ch) {
  return typeof ch === 'string' && /\s/.test(ch) && ch !== '\n'
}

function nl (ch) {
  return ch === '\n'
}
