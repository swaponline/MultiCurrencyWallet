import SwapApp from 'swap.app'
import { NATIVE as NATIVE_COINS } from 'swap.app/constants/COINS'


// Проверка на количество одновременных свапов с одиним оредер-тейкером
// Если есть активные свапы - вернет false
export const checkParticipant = (participant): boolean => {
  let activeSwaps: number = 0

  Object.keys(NATIVE_COINS).forEach((coin: string) => {
    if (participant[coin] !== undefined
      && participant[coin].address !== undefined
    ) {
      //@ts-ignore: strictNullChecks
      activeSwaps += SwapApp.shared().getSwapsByAddress(
        coin,
        participant[coin].address
      ).length
    }
  })
  return (activeSwaps === 0)
}
