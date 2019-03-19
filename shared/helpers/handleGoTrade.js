import SwapApp, { util } from 'swap.app'
import actions from 'redux/actions'
import moment from 'moment/moment'


const getDeclinedExistedSwapIndex = ({ currency, decline }) => {

  const date = Date.now() / 1000

  const indexOfDecline = decline.length - 1
  const declineSwap = actions.core.getSwapById(decline[indexOfDecline])

  const itemState = declineSwap.flow.state

  const values = itemState.btcScriptValues || itemState.ltcScriptValues || itemState.usdtScriptValues || itemState.scriptValues

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
