import SwapApp from 'swap.app'
import { NATIVE as NATIVE_COINS } from 'swap.app/constants/COINS'


export const checkParticipant = (participant): boolean => {

  let activeSwaps: number = 0
  Object.keys(NATIVE_COINS).forEach((coin: string) => {
    if (participant[coin] !== undefined
      && participant[coin].address !== undefined
    ) {
      activeSwaps += SwapApp.shared().getSwapsByAddress(
        coin,
        participant[coin].address
      ).length
    }
  })
  return (activeSwaps === 0)
}
