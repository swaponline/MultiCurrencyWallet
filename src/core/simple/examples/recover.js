//const swap = require('simple.swap.core')
const swap = require('./../src/index')

const {
  room: { ready },
  orders: { request, subscribe },
  swap: { onStep, start, get },
} = swap.helpers

const { room } = swap.setup()

const swapID = process.argv[2]
const method = process.argv[3]
const values = process.argv.slice(4)

const getValue = (swap, method, values) => {
  return new Promise((resolve, reject) => {
    if (typeof swap.flow[method] !== 'function') {
      resolve(swap.flow[method])
    }

    const res = swap.flow[method](...values)

    if (!res.then) {
      resolve(res)
    }

    res
      .then(value => {
        resolve(value)
      })
      .catch(err => {
        resolve(null)
        console.error(err)
      })
  })
}


const _ = (async () => {
  console.clear()
  console.log('IPFS loading...')

  await ready(room)

  console.clear()
  console.log('Swap id =', swapID)
  console.log()

  const swap = get(swapID)

  if (!method) {
    process.exit(0)
  }

  console.log(`swap.flow.${method}(${values})`)
  console.log()

  getValue(swap, method, values).then(value => {
    console.log(`swap.flow.${method}(${values}) =>`, value)
    process.exit(0)
  })
})()
