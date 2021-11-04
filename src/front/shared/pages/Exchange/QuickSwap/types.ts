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

export enum Sections {
  Aggregator,
  Source,
  Settings,
}

export enum Actions {
  Swap,
  AddLiquidity,
  RemoveLiquidity,
}

export enum Direction {
  Spend,
  Receive,
}

export enum BlockReasons {
  InsufficientSlippage,
  NoLiquidity,
  NoBalance,
  NoBaseCurrencyBalance,
  Liquidity,
  Unknown,
}

export type ComponentState = {
  externalExchangeReference: null | IUniversalObj
  externalWindowTimer: null | NodeJS.Timeout
  currencies: CurrencyMenuItem[]
  receivedList: CurrencyMenuItem[]
  baseChainWallet: IUniversalObj
  error: IError | null
  activeSection: Sections
  isPending: boolean
  isSourceMode: boolean
  needApprove: boolean
  fiat: string
  fiatAmount: number
  spendedCurrency: CurrencyMenuItem
  spendedAmount: string
  fromWallet: IUniversalObj
  receivedCurrency: CurrencyMenuItem
  receivedAmount: string
  toWallet: IUniversalObj
  sourceAction: Actions
  slippage: number
  userDeadline: number
  slippageMaxRange: number
  wrongNetwork: boolean
  network: Network
  swapData: SwapData | undefined
  swapFee: string
  gasPrice: string
  gasLimit: string
  showOrders: boolean
  blockReason: BlockReasons | undefined
  coinDecimals: 18
  liquidityErrorMessage: string
}
