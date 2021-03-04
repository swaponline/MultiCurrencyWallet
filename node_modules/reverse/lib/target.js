'use strict'

const querystring = require('querystring')
const quotemeta = require('quotemeta')

module.exports = class Target {
  constructor (method, route, target) {
    this.method = method
    this.route = coalesceStrings(route)
    this.params = normalizeParams(this.route.filter(xs => typeof xs !== 'string'))
    this.expectCount = this.params.reduce((acc, xs) => {
      return acc + xs.groupCount
    }, 0)
    this.output = this.params.map(xs => [xs.name, null])
    this.isConcat = (
      this.route.length === 1 &&
      this.route[0] === '/' &&
      this.method === '*'
    )
    this.regex = routeToRegExp(this.route)
    this.name = target
  }

  accepts (method) {
    if (this.method === '*') {
      return true
    }
    return this.method === method
  }

  match (route) {
    const result = this.regex.exec(route)
    if (!result) {
      return
    }
    if (result.length !== this.expectCount + 1) {
      return
    }
    for (var i = 0, j = 0; i < this.params.length; ++i) {
      const coerced = this.params[i].validate(
        querystring.unescape(result[j + 1])
      )
      if (coerced.error) {
        return
      }
      this.output[i][1] = coerced.value
      j += this.params[i].groupCount
    }

    // if we've made it all the way through and all parameters are
    // valid, *then* contribute to the context
    return [new Map(this.output), route.slice(result[0].length)]
  }
}

function coalesceStrings (route) {
  return route.reduce((acc, xs) => {
    if (typeof xs === 'string') {
      if (typeof acc[acc.length - 1] === 'string') {
        acc[acc.length - 1] += xs
        return acc
      }
    }
    acc.push(xs)
    return acc
  }, [])
}

function routeToRegExp (bits) {
  return new RegExp(
    '^' +
    bits.map(
      xs => typeof xs === 'string'
        ? quotemeta(xs)
        : xs.regex
    ).join('')
  )
}

function normalizeParams (params) {
  return params.map(xs => {
    xs.regex = xs.regex || '([^\\/]+)'
    xs.groupCount = countGroups(xs.regex)
    return xs
  })
}

function countGroups (src) {
  var count = 0
  for (var i = 0; i < src.length; ++i) {
    switch (src[i]) {
      case '\\':
        ++i
        break
      case '(':
        if (src[i + 1] === '?') {
          if (src[i + 2] === ':' ||
              src[i + 2] === '!' ||
              src[i + 2] === '=') {
            break
          }
        }
        ++count
        break
    }
  }
  return count
}
