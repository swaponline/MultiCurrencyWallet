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
  coin1: {
    ticker: any
    amount: any
    takerAddress: any
    makerAddress: any
  },
  coin2: {
    ticker: any
    amount: any
    makerAddress: any
    takerAddress: any
  }
}

export enum TurboSwapStep {
  TakerSendsToMaker = 'TakerSendsToMaker',
  MakerSendsToTaker = 'MakerSendsToTaker',
  Finished = 'Finished',
}

export interface ITurboSwapState {
  coin1: {
    isTakerSended: boolean
    isMakerReceived: boolean
  },
  coin2: {
    isMakerSended: boolean
    isTakerReceived: boolean
  }
}