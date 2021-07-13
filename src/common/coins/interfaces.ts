import bitcore from 'bitcore-lib'

export interface ICoin {
  ticker: string
  name: string
  precision: number
  networks: { [key: string]: string }
}

export interface ILibAdapter {
  accountFromMnemonic(mnemonic: string, netName: string): {
    privateKey: bitcore.PrivateKey
    publicKey: bitcore.PublicKey
    address: bitcore.Address
  }
  createTx?({ netName, account, amount, to }): Promise<string> // not sure what the <string>
}

export interface IConnector {
  getApiUrl(netwType: string): string
  getTxUrl(netType: string, txId: string): string
  fetchBalance(networkType: string, address: string): Promise<number>

  fetchUnspents?(netType: string, addr: string): Promise<JSON>
  fetchTx?(txid: string): Promise<void> // this method is empty now
  fetchRawTx?(txid: string): Promise<void> // this method is empty now
  publishRawTx?(netType: string, rawTx: string): Promise<JSON>
  publishTx?(networkType: string, rawTx: string): Promise<JSON>
}