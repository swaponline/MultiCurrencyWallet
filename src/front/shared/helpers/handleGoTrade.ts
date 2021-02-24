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

  if (indexOfDecline >= 0) {
    for (let i = 0; i <= indexOfDecline; i++) {
      const declineSwap = getSwapByIdSafe(decline[i])

      if (declineSwap) {
        const itemState = declineSwap.flow.state
        const values = itemState.utxoScriptValues

        if (values) {
          const { isFinished, isRefunded, isStoppedSwap } = itemState

          //@ts-ignore
          const lockTime = moment.unix(values.lockTime || date)._i / 1000
          const timeSinceLock = date - lockTime

          if (isFinished || isRefunded || isStoppedSwap || timeSinceLock > 259200) { // 259200 3 дня в секундах
            actions.core.forgetOrders(decline[i])
          } else if (declineSwap.sellCurrency === currency.toUpperCase()
            //@ts-ignore
            && !declineSwap.isSwapExist
            && !declineSwap.isMy) {
            return i
          }
        }
      }
    }
  }
  return false
}

export default {
  getDeclinedExistedSwapIndex,
}
