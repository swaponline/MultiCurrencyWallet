import * as swap from 'simple.swap.core'


const {
  swap: { get },
  history,
} = swap.helpers

const { app } = swap.setup({})

history.init(app)

const swaps = history.getAllInProgress()
  .map(id => get(app, { id }))
  .filter(({ flow: { isRefunded }}) => isRefunded !== true)

console.log('swaps', swaps.length)
swaps.map(swap => console.log('swap', swap.id, swap.flow.step))

swaps
  .filter(swap => swap.flow.step === 6)
  .map(swap => console.log('swap', swap))
