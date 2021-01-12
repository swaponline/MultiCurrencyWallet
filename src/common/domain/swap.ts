import BigNumber from 'bignumber.js'


export enum SwapType {
  Atomic = 'Atomic',
  Direct = 'Direct',
}

export enum SwapSide {
  Maker = 'Maker',
  Taker = 'Taker',
}

export interface ITurboSwapConditions {
  /*TakerCoin: any
  TakerAddressFrom: any
  MakerAddressTo: any
  MakerCoin: any
  MakerAddressFrom: any
  TakerAddressTo: any*/
  mySide: SwapSide
  coinA: {
    ticker: any
    amount: BigNumber
    takerAddress: any
    makerAddress: any
  },
  coinB: {
    ticker: any
    amount: BigNumber
    makerAddress: any
    takerAddress: any
  }
}

export enum TurboSwapStep {
  TakerSendsToMaker = 'TakerSendsToMaker',
  MakerSendsToTaker = 'MakerSendsToTaker',
  Finished = 'Finished',
}

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

export enum SwapStatus {
  Pending = 'Pending',
  Finished = 'Finished',
}

export interface ITurboSwap {
  id: any
  mySide: SwapSide
  conditions: ITurboSwapConditions
  //state: ITurboSwapState
  status: SwapStatus
  takerTx: SwapTx
  makerTx: SwapTx
}

export type SwapTx = {
  status: SwapTxStatus.Expected
  hash: null
} | {
  status: SwapTxStatus.Pending
  hash: string
} | {
  status: SwapTxStatus.Done
  hash: string
}

export enum SwapTxStatus {
  Expected = 'Expected',
  Pending = 'Pending',
  Done = 'Done'
}