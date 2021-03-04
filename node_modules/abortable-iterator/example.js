const abortable = require('./')
const AbortController = require('abort-controller')

async function main () {
  // An example function that creates an async iterator that yields an increasing
  // number every x milliseconds and NEVER ENDS!
  const asyncCounter = async function * (start, delay) {
    let i = start
    while (true) {
      yield new Promise(resolve => setTimeout(() => resolve(i++), delay))
    }
  }

  // Create a counter that'll yield numbers from 0 upwards every second
  const everySecond = asyncCounter(0, 1000)

  // Make everySecond abortable!
  const controller = new AbortController()
  const abortableEverySecond = abortable(everySecond, controller.signal)

  // Abort after 5 seconds
  setTimeout(() => controller.abort(), 5000)

  try {
    // Start the iteration, which will throw after 5 seconds when it is aborted
    for await (const n of abortableEverySecond) {
      console.log(n)
    }
  } catch (err) {
    if (err.code === 'ERR_ABORTED') {
      // Expected - all ok :D
    } else {
      throw err
    }
  }
}

main()
