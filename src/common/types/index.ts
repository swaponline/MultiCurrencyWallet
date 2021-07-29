export type MnemonicKey = string | string[]

export enum TransactionStatus {
  Pending = 1,
  Ready = 2,
  Reject = 3,
  Cancel = 4,
}
