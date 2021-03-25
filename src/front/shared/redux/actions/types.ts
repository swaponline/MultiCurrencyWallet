export type MnemonicKey = string | string[]

export enum ITransactionStatus {
  pending = 1,
  ready = 2,
  reject = 3,
  cancel = 4,
}