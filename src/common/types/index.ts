export type MnemonicKey = string | string[]

export enum TransactionStatus {
  Pending = 1,
  Ready = 2,
  Reject = 3,
  Cancel = 4,
}

export interface Token {
  address: string
  contractAddress: string
  baseCurrency: string
  blockchain: string
  currency: string
  fullName: string
  standard: string
  tokenKey: string // {baseCurrency}name
  name: string
  balance: number
  decimals: number
  balanceError: boolean
  isBalanceFetched: boolean
  isConnected: boolean
  isMetamask: boolean
  isMnemonic: boolean
  isToken: boolean
}