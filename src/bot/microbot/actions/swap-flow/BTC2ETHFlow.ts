import handleError from '../../../app/actions/errors/handleError'
import getSecret from './genSecret'

export default (swap) => {
  switch (swap.flow.state.step) {
    case 2:
      const _secret = getSecret()
      return swap.flow.submitSecret(_secret)
    case 3:
      swap.flow.syncBalance()
      return
  }

  return swap
}
