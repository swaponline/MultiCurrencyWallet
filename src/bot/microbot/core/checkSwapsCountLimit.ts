import SwapApp from 'swap.app'


// Проверка лимита на кол-во активных свапов
// Если true - проверка прошла - лимит не превышен
export const checkSwapsCountLimit = (): boolean => {
  if (process.env.MAX_PARALLEL_SWAPS !== undefined
    && Number(process.env.MAX_PARALLEL_SWAPS) !== 0
  ) {
    //@ts-ignore: strictNullChecks
    const activeSwapsCount = SwapApp.shared().getActiveSwaps().length
    if (activeSwapsCount >= Number(process.env.MAX_PARALLEL_SWAPS)) {
      return false
    }
  }
  return true
}