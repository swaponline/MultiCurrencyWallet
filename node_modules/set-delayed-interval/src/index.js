'use strict'

const intervals = new Map()

const _generateId = () => `${Date.now()}:${Math.floor(Math.random() * 1000000)}`

/**
 * Run a given task each {interval} ms
 *
 * @param {() => Promise} task
 * @param {number} interval
 * @param {string} id
 */
async function _runPeriodically (task, interval, id) {
  while (intervals.get(id)) {
    try {
      await task()
    } catch (err) {
      // Throw global context error if handler throws
      setTimeout(() => { throw err }, 1)
      break
    }

    if (!intervals.get(id)) {
      break
    }

    await new Promise(resolve => {
      const _timeout = setTimeout(resolve, interval)

      intervals.set(id, _timeout)
    })
  }
}

/**
 * Asynchronous setInterval that is properly delayed using promises and can be delayed on boot.
 *
 * @param {() => Promise} task
 * @param {number} interval
 * @param {number} [delay = interval]
 * @returns {string}
 */
function setDelayedInterval (task, interval, delay) {
  delay = delay || interval

  const id = _generateId()
  const _timeout = setTimeout(() => {
    _runPeriodically(task, interval, id)
  }, delay)

  intervals.set(id, _timeout)

  return id
}

/**
 * Clear delayed interval.
 *
 * @param {string} id
 */
function clearDelayedInterval (id) {
  const _timeout = intervals.get(id)

  if (_timeout) {
    clearTimeout(_timeout)
    intervals.delete(id)
  }
}

module.exports = {
  setDelayedInterval,
  clearDelayedInterval
}
