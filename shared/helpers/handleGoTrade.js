import SwapApp, { util } from 'swap.app'
import actions from 'redux/actions'


const isSwapExist = ({ currency, decline }) => {

  const length = decline.length - 1
  const declineSwap = actions.core.getSwapById(decline[length])

  for (let i = 0; i <= length; i++) {
    if (declineSwap.flow.state.isFinished === true) {
      actions.core.forgetOrders(decline[i])
    } else if (declineSwap.sellCurrency === currency.toUpperCase()
      && !declineSwap.isSwapExist
      && !declineSwap.isMy) {
      return length
    } else {
      return false
    }
  }
}

export default {
  isSwapExist,
}
