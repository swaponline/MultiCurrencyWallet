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
  protocols: any // any[]
  tx: {
    data: string
    from: string
    gas: number
    gasPrice: string
    to: string
    value: string
  }
}

export type Network = {
  currency: string
  chainId: number
  networkVersion: number
  chainName: string
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

export type ComponentState = {
  externalExchangeReference: null | IUniversalObj
  currencies: CurrencyMenuItem[]
  error: IError | null
  isPending: boolean
  isDataPending: boolean
  isSwapPending: boolean
  needApprove: boolean
  fiat: string
  fiatAmount: number
  spendedCurrency: CurrencyMenuItem
  spendedAmount: string
  fromWallet: IUniversalObj
  receivedCurrency: CurrencyMenuItem
  receivedAmount: string
  toWallet: IUniversalObj
  slippage: number
  slippageMaxRange: number
  network: Network
  isAdvancedMode: boolean
  // TODO
  additionalFeatures: AdvancedOptions | any
  swapData: SwapData | undefined
}
