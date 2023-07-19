// @ts-nocheck
import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'
import config from 'helpers/externalConfig'


const initConnector = (chainId) => {
  const [walletConnectV2, hooks] = initializeConnector<WalletConnectV2>(
    (actions) => {
      return new WalletConnectV2({
        actions,
        options: {
          projectId: config.api.WalletConnectProjectId,
          chains: [chainId],
          optionalChains: [],
          showQrModal: true,
        },
      })
    }
  )
  return [walletConnectV2, hooks]
}

export default class WalletConnectProviderV2 {
  _web3Connect = null

  private _hooks: Web3ReactHooks | WalletConnectV2
  private _walletConnectV2: Web3ReactHooks | WalletConnectV2
  private _options = {}
  private _inited = false

  constructor(web3Connect, options) {
    this._web3Connect = web3Connect
    this._options = options
    const [walletConnectV2, hooks] = initConnector(this._options.chainId)
    this._hooks = hooks
    this._walletConnectV2 = walletConnectV2

    // debug class 
    window.testWC = this
  }

  async initProvider() {
    try {
      await this._walletConnectV2.activate(this._options.chainId)
      this._inited = true
    } catch (err) {
      console.log('>>> fail init - reset')
    }
  }
  
  getAccount() {
    if (this._walletConnectV2 && this._walletConnectV2.provider) {
      return this._walletConnectV2.provider.accounts[0]
    } else {
      return `Not connected`
    }
  }
  getChainId() {
    if (this._walletConnectV2 && this._walletConnectV2.provider) {
      return this._walletConnectV2.provider.chainId
    } else {
      return 0
    }
  }
  getProvider() {
    return this._walletConnectV2.provider
  }
  
  async isConnected() {
    return (
      this._walletConnectV2
      && this._walletConnectV2.provider
      && this._walletConnectV2.provider.connected
    )
  }

  isLocked() {
    return false
  }

  async Disconnect() {
    if (this._walletConnectV2 && this._walletConnectV2.provider) {
      await this._walletConnectV2.provider.disconnect()
    }
  }

  on(event, callback) {}

  async Connect() {
    if (!this._inited) return false
    try {
      await this._walletConnectV2.activate(this._options.chainId)
      const connection = await this.isConnected()
      return !!connection
    } catch (err) {
      /* Cancel connect */
      console.log('>>> WC - Fail connect')
      console.error(err)
      return false
    }
  }
}