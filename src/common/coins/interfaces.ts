export interface ICoin {
  ticker: string
  name: string
  precision: number
  networks: { [key: string]: string }
}

export interface ILibAdapter {
  accountFromMnemonic(mnemonic: string, netName: string): {
    privateKey: string
    publicKey: string
    address: string
  }
  createTx?({ netName, account, amount, to }): Promise<any>
}

export interface IConnector {
  getApiUrl(netwType: string): string
  getTxUrl(netType: string, txId: string): string
  fetchBalance(networkType: string, address: string): Promise<number>

  fetchUnspents?(netType: string, addr: string): Promise<JSON>
  fetchTx?(tsid: string): Promise<void>
  fetchRawTx?(tsid: string): Promise<void>
  publishRawTx?(netType: string, rawTx: string): Promise<JSON>
  publishTx?(networkType: string, rawTx: string): Promise<JSON>
}