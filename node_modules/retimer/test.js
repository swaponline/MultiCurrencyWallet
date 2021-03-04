'use strict'

var test = require('tape')
var retimer = require('./')

test('schedule a callback', function (t) {
  t.plan(1)

  var start = Date.now()

  retimer(function () {
    t.ok(Date.now() - start >= 50, 'it was deferred ok!')
  }, 50)
})

test('reschedule a callback', function (t) {
  t.plan(2)

  var start = Date.now()

  var timer = retimer(function () {
    t.ok(Date.now() - start >= 70, 'it was deferred ok!')
  }, 50)

  setTimeout(function () {
    t.equal(timer.reschedule(50), true, 'returns true')
  }, 20)
})

test('reschedule multiple times', function (t) {
  t.plan(1)

  var start = Date.now()

  var timer = retimer(function () {
    t.ok(Date.now() - start >= 90, 'it was deferred ok!')
  }, 50)

  setTimeout(function () {
    timer.reschedule(50)
    setTimeout(function () {
      timer.reschedule(50)
    }, 20)
  }, 20)
})

test('clear a timer', function (t) {
  t.plan(1)

  var timer = retimer(function () {
    t.fail('the timer should never get called')
  }, 20)

  timer.clear()

  setTimeout(function () {
    t.pass('nothing happened')
  }, 50)
})

test('clear a timer after a reschedule', function (t) {
  t.plan(1)

  var timer = retimer(function () {
    t.fail('the timer should never get called')
  }, 20)

  setTimeout(function () {
    timer.reschedule(50)
    setTimeout(function () {
      timer.clear()
    }, 10)
  }, 10)

  setTimeout(function () {
    t.pass('nothing happened')
  }, 50)
})

test('return false if rescheduled too early', function (t) {
  t.plan(2)

  var start = Date.now()

  var timer = retimer(function () {
    t.ok(Date.now() - start >= 50, 'it was deferred ok!')
  }, 50)

  setTimeout(function () {
    t.equal(timer.reschedule(10), false, 'return false')
  }, 20)
})

test('pass arguments to the callback', function (t) {
  t.plan(1)

  retimer(function (arg) {
    t.equal(arg, 42, 'argument matches')
  }, 50, 42)
})
