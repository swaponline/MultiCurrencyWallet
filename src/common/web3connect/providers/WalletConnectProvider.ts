import {
  WalletConnectConnector,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
} from '@web3-react/walletconnect-connector'

export default class WalletConnectProvider extends WalletConnectConnector {
  _web3Connect = null

  constructor(web3Connect, options) {
    super(options)
    this._web3Connect = web3Connect
  }

  async isConnected() {
    try {
      const address = await super.getAccount()

      return !!address
    } catch (err) {
      // try restore connection
      let connectionInfo: any = localStorage.getItem(`walletconnect`)
      try {
        if (connectionInfo) connectionInfo = JSON.parse(connectionInfo)
      } catch (e) {}
      if (connectionInfo && connectionInfo.connected) {
        if (await this.Connect()) {
          return true
        }
      }
    }
    return false
  }

  isLocked() {
    return false
  }

  async Disconnect() {
    await this.close()
    await this.deactivate()
    localStorage.removeItem(`walletconnect`)
  }

  async Connect() {
    try {
      const connection = await super.activate()

      return !!connection
    } catch (err) {
      if (err instanceof UserRejectedRequestErrorWalletConnect) {
        console.warn('User reject connect to Injected provider')
      } else {
        console.error(err)
      }
      return false
    }
  }
}