'use strict'

module.exports = intersection

const filter = require('@iterables/filter')
const chain = require('@iterables/chain')

function intersection (lhs, rhs) {
  return new Set(chain(
    filter(lhs, xs => rhs.has(xs)),
    filter(rhs, xs => lhs.has(xs))
  ))
}
