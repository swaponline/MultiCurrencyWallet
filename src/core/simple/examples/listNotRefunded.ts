import * as swap from '../src'

const {
  swap: { get },
  history: { getAllInProgress },
} = swap.helpers

const app = swap.setup({})

getAllInProgress()
  .map(id => get(app, id))
  .filter(({ flow: { isRefunded }}) => isRefunded !== true)
  .map(swap => console.log('swap:', swap))

process.exit(0)
