import BigNumber from 'bignumber.js'


export enum SwapMode {
  Atomic = 'Atomic',
  Turbo = 'Turbo',
}

export enum SwapSide {
  Maker = 'Maker',
  Taker = 'Taker',
}

export enum SwapTxStatus {
  Expected = 'Expected',
  Pending = 'Pending',
  Done = 'Done'
}

export enum SwapStatus {
  Pending = 'Pending',
  Finished = 'Finished',
}

/*
export interface ITurboSwapConditions {
  TakerCoin: ...
  TakerAddressFrom: ...
  MakerAddressTo: ...
  MakerCoin: ...
  MakerAddressFrom: ...
  TakerAddressTo: ...
  mySide: SwapSide
  coinA: {
    ticker: ...
    amount: BigNumber
    takerAddress: ...
    makerAddress: ...
  },
  coinB: {
    ticker: ...
    amount: BigNumber
    makerAddress: ...
    takerAddress: ...
  }
  
}
*/

/*export enum TurboSwapStep {
  TakerSendsToMaker = 'TakerSendsToMaker',
  MakerSendsToTaker = 'MakerSendsToTaker',
  Finished = 'Finished',
}*/

/*export interface ITurboSwapState {
  takerTxHash: string
  makerTxHash: string

  coin1: {
    isTakerSended: boolean
    isMakerReceived: boolean
  },
  coin2: {
    isMakerSended: boolean
    isTakerReceived: boolean
  }
}*/

/*export interface ITurboSwap {
  id: any
  mySide: SwapSide
  conditions: ITurboSwapConditions
  //state: ITurboSwapState
  status: SwapStatus
  takerTx: SwapTx
  makerTx: SwapTx
}*/

/*export type SwapTx = {
  status: SwapTxStatus.Expected
  hash: null
} | {
  status: SwapTxStatus.Pending
  hash: string
} | {
  status: SwapTxStatus.Done
  hash: string
}*/
