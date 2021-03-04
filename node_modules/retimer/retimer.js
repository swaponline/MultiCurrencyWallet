'use strict'

var getTime = require('./time')

function Retimer (callback, timeout, args) {
  var that = this

  this._started = getTime()
  this._rescheduled = 0
  this._scheduled = timeout
  this._args = args

  this._timer = setTimeout(timerWrapper, timeout)

  function timerWrapper () {
    if (that._rescheduled > 0) {
      that._scheduled = that._rescheduled - (getTime() - that._started)
      that._timer = setTimeout(timerWrapper, that._scheduled)
      that._rescheduled = 0
    } else {
      callback.apply(null, that._args)
    }
  }
}

Retimer.prototype.reschedule = function (timeout) {
  var now = getTime()
  if ((now + timeout) - (this._started + this._scheduled) < 0) {
    return false
  } else {
    this._started = now
    this._rescheduled = timeout
    return true
  }
}

Retimer.prototype.clear = function () {
  clearTimeout(this._timer)
}

function retimer () {
  if (typeof arguments[0] !== 'function') {
    throw new Error('callback needed')
  }

  if (typeof arguments[1] !== 'number') {
    throw new Error('timeout needed')
  }

  var args

  if (arguments.length > 0) {
    args = new Array(arguments.length - 2)

    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i + 2]
    }
  }

  return new Retimer(arguments[0], arguments[1], args)
}

module.exports = retimer
