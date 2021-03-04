'use strict'

module.exports = {
  /**
   * A tick is considered valid if it happened between now
   * and `ms` milliseconds ago
   *
   * @param {number} date - Time in ticks
   * @param {number} ms - max milliseconds that should have expired
   * @returns {boolean}
   */
  isValidTick: function isValidTick (date, ms = 5000) {
    const now = Date.now()
    if (date > now - ms && date <= now) return true
    return false
  }
}
