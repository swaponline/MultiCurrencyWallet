export type CurrencyMenuItem = {
  name: string
  title: string
  icon: string
  value: string
  fullTitle: string
  blockchain: string
  standard: string
}

export type ExchangedСurrency = {
  name: string
  address: string
  amount: number
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
  wallets: IUniversalObj[]
  currencies: CurrencyMenuItem[]
  error: IError | null
  isPending: boolean
  fiat: string
  fiatAmount: number
  spendedCurrency: ExchangedСurrency
  receivedCurrency: ExchangedСurrency
  slippage: number
  advancedOptions: AdvancedOptions | any // TODO AdvancedOptions
  chainId: number
}
