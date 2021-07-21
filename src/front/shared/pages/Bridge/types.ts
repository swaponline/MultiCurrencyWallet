export type CurrencyMenuItem = {
  name: string
  title: string
  icon: string
  value: string
  fullTitle: string
  blockchain: string
  standard: string
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
  spendedCurrency: string
  spendedAmount: number
  fromAddress: string
  receivedCurrency: string
  receivedAmount: number
  toAddress: string
  slippage: number
  chainId: number
  isAdvancedMode: boolean
  advancedOptions: AdvancedOptions | any // TODO AdvancedOptions
}
