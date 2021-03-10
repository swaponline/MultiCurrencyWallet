import handleError from '../../../app/actions/errors/handleError'
import getSecret from './genSecret'


export default (swap) => {
  switch (swap.flow.state.step) {
    case 3:
      //swap.flow.syncBalance()
      return
  }

  return swap
}
