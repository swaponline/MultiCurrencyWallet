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

export enum Sections {
  Aggregator,
  Source,
  Settings,
}

export enum Actions {
  Swap,
  AddLiquidity,
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
  PairDoesNotExist,
  NotApproved,
  Unknown,
}

export type ServiceFee = {
  address: string
  percent: number
}

export type ComponentState = {
  externalExchangeReference: null | IUniversalObj
  externalWindowTimer: null | NodeJS.Timeout
  currentLiquidityPair: null | string
  currencies: CurrencyMenuItem[]
  receivedList: CurrencyMenuItem[]
  baseChainWallet: IUniversalObj
  error: IError | null
  activeSection: Sections
  isPending: boolean
  isSourceMode: boolean
  onlyAggregator: boolean
  onlySource: boolean
  needApproveA: boolean
  needApproveB: boolean
  fiat: string
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
  network: EvmNetworkConfig
  swapData: SwapData | undefined
  swapFee: string
  gasPrice: string
  gasLimit: string
  blockReason: BlockReasons | undefined
  liquidityErrorMessage: string
  serviceFee: ServiceFee | false
}
