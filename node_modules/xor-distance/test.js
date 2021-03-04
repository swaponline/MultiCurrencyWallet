var tape = require('tape')
var distance = require('./')

tape('distance', function (t) {
  t.same(distance(Buffer.from([1, 0]), Buffer.from([0, 1])), Buffer.from([1, 1]))
  t.same(distance(Buffer.from([1, 1]), Buffer.from([0, 1])), Buffer.from([1, 0]))
  t.same(distance(Buffer.from([1, 1]), Buffer.from([1, 1])), Buffer.from([0, 0]))
  t.end()
})

tape('compare', function (t) {
  t.same(distance.compare(Buffer.from([0, 0]), Buffer.from([0, 1])), -1)
  t.same(distance.compare(Buffer.from([0, 1]), Buffer.from([0, 1])), 0)
  t.same(distance.compare(Buffer.from([1, 1]), Buffer.from([0, 1])), 1)
  t.end()
})

tape('shorthands', function (t) {
  t.ok(distance.lt(Buffer.from([0, 0]), Buffer.from([0, 1])))
  t.ok(distance.eq(Buffer.from([0, 1]), Buffer.from([0, 1])))
  t.ok(distance.gt(Buffer.from([1, 1]), Buffer.from([0, 1])))
  t.end()
})
