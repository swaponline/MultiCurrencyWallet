export type CurrencyMenuItem = {
  name: string
  title: string
  icon: string
  value: string
  fullTitle: string
  blockchain?: string
  standard?: string
}

export type AdvancedOptions = {
  protocols: any
  destReceiver: any
  referrerAddress: any
  fee: any
  gasPrice: any
  burnChi: any
  complexityLevel: any
  connectorTokens: any
  allowPartialFill: any
  disableEstimate: any
  gasLimit: any
  parts: any
  mainRouteParts: any
}

export type TokenData = {
  symbol: string
  name: string
  decimals: number
  address: string
  logoURI: string
}

export type SwapData = {
  fromToken: TokenData
  toToken: TokenData
  fromTokenAmount: string
  toTokenAmount: string
  protocols: any // [Array(3)]
  tx: {
    data: string
    from: string
    gas: number
    gasPrice: string
    to: string
    value: string
  }
}

export type ComponentState = {
  externalExchangeReference: null | IUniversalObj
  currencies: CurrencyMenuItem[]
  error: IError | null
  isPending: boolean
  isDataPending: boolean
  isSwapPending: boolean
  fiat: string
  fiatAmount: number
  spendedCurrency: CurrencyMenuItem
  spendedAmount: string
  fromWallet: IUniversalObj
  receivedCurrency: CurrencyMenuItem
  receivedAmount: number
  toWallet: IUniversalObj
  slippage: number
  slippageMaxRange: number
  chainId: number
  isAdvancedMode: boolean
  // TODO
  advancedOptions: AdvancedOptions | any
  swapData: SwapData | undefined
}
