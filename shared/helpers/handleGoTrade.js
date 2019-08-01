import SwapApp, { util } from 'swap.app'
import actions from 'redux/actions'
import moment from 'moment/moment'


const getSwapByIdSafe = (swapID) => {
  try {
    const returnedSwap = actions.core.getSwapById(swapID)
    return returnedSwap
  } catch (noFlowError) {
    return false
  }
}
const getDeclinedExistedSwapIndex = ({ currency, decline }) => {

  const date = Date.now() / 1000

  const indexOfDecline = decline.length - 1
  const declineSwap = getSwapByIdSafe(decline[indexOfDecline])

  if (!declineSwap) return false

  const itemState = declineSwap.flow.state
  const values = itemState.btcScriptValues
    || itemState.bchScriptValues
    || itemState.ltcScriptValues
    || itemState.USDTomniScriptValues
    || itemState.scriptValues

  if (values === undefined) {
    return false
  }

  const lockTime = moment.unix(values.lockTime || date)._i / 1000
  const timeSinceLock = date - lockTime

  for (let i = 0; i <= indexOfDecline; i++) {
    if (declineSwap.flow.state.isFinished === true || timeSinceLock > 259200) { // 259200 3 дня в секундах
      actions.core.forgetOrders(decline[i])
    } else if (declineSwap.sellCurrency === currency.toUpperCase()
      && !declineSwap.isSwapExist
      && !declineSwap.isMy) {
      return indexOfDecline
    } else {
      return false
    }
  }
  return false
}

export default {
  getDeclinedExistedSwapIndex,
}
