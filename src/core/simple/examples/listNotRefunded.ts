import swap from '../src'

const {
  swap: { read },
  history: { getAllInProgress },
} = swap.helpers

swap.setup()

getAllInProgress()
  .map(id => read({ id }))
  .filter(({ flow: { isRefunded }}) => isRefunded !== true)
  .map(swap => console.log('swap:', swap))

process.exit(0)
