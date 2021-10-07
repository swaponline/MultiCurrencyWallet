export type CurrencyMenuItem = {
  name: string
  title: string
  icon: string
  value: string
  fullTitle: string
  blockchain?: string
  standard?: string
  notExist?: boolean
}

export type TokenData = {
  symbol: string
  name: string
  decimals: number
  address: string
  logoURI: string
}

export type SwapData = {
  allowanceTarget: string
  buyAmount: string
  data: string
  gasPrice: string
  gas: string
  sellAmount: string
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
  externalWindowTimer: null | NodeJS.Timeout
  currencies: CurrencyMenuItem[]
  receivedList: CurrencyMenuItem[]
  baseChainWallet: IUniversalObj
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
  slippage: number | undefined
  slippageMaxRange: number
  wrongNetwork: boolean
  network: Network
  isAdvancedMode: boolean
  swapData: SwapData | undefined
  swapFee: string
  gasPrice: string
  gasLimit: string
  showOrders: boolean
  mnemonicSaved: boolean
  blockReason: SwapBlockReason | undefined
  coinDecimals: 18
}

export enum Direction {
  Spend,
  Receive,
}

export enum SwapBlockReason {
  InsufficientSlippage,
  NoLiquidity,
  NoBalance,
  Unknown,
}
