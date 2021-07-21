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

export type ComponentState = {
  externalExchangeReference: null | IUniversalObj
  currencies: CurrencyMenuItem[]
  error: IError | null
  isPending: boolean
  fiat: string
  fiatAmount: number
  spendedCurrency: CurrencyMenuItem
  spendedAmount: string
  fromAddress: string
  fromWallet: IUniversalObj
  receivedCurrency: CurrencyMenuItem
  receivedAmount: number
  toAddress: string
  toWallet: IUniversalObj
  slippage: number
  slippageMaxRange: number
  chainId: number
  isAdvancedMode: boolean

  // TODO
  advancedOptions: AdvancedOptions | any
}
