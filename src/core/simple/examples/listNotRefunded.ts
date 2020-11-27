import swap from '../src'

const {
  swap: { read },
  history: { getAllInProgress },
} = swap.helpers
//@ts-ignore
swap.setup()

getAllInProgress()
  //@ts-ignore
  .map(id => read({ id }))
  .filter(({ flow: { isRefunded }}) => isRefunded !== true)
  .map(swap => console.log('swap:', swap))

process.exit(0)
