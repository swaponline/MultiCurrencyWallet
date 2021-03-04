'use strict'

var bench = require('fastbench')
var retimer = require('./')
var max = 10000

function benchSetTimeout (done) {
  var timers = new Array(max)
  var completed = 0
  var toReschedule = 20

  schedule()

  function complete () {
    if (++completed === max) {
      done()
    }
  }

  function schedule () {
    for (var i = 0; i < max; i++) {
      if (timers[i]) {
        clearTimeout(timers[i])
      }
      timers[i] = setTimeout(complete, 50)
    }
    if (--toReschedule > 0) {
      setTimeout(schedule, 10)
    }
  }
}

function benchRetimer (done) {
  var timers = new Array(max)
  var completed = 0
  var toReschedule = 20

  schedule()

  function complete () {
    if (++completed === max) {
      done()
    }
  }

  function schedule () {
    for (var i = 0; i < max; i++) {
      if (timers[i]) {
        timers[i].reschedule(50)
      } else {
        timers[i] = retimer(complete, 50)
      }
    }
    if (--toReschedule > 0) {
      setTimeout(schedule, 10)
    }
  }
}

var run = bench([
  benchSetTimeout,
  benchRetimer
], 100)

run(run)
