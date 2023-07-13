// @ts-nocheck
import {
  WalletConnectConnector,
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
} from '@web3-react/walletconnect-connector'

import { initializeConnector, Web3ReactHooks } from '@web3-react/core'
import { URI_AVAILABLE } from '@web3-react/walletconnect-v2'
import { WalletConnect as WalletConnectV2 } from '@web3-react/walletconnect-v2'

const initConnector = (chainId) => {
  const [walletConnectV2, hooks] = initializeConnector<WalletConnectV2>(
    (actions) =>
      new WalletConnectV2({
        actions,
        options: {
          projectId: `a23677c4af3139b4eccb52981f76ad94`, //`process.env.walletConnectProjectId`,
          chains: [chainId],
          optionalChains: [],
          showQrModal: true,
        },
      })
  )
  return [walletConnectV2, hooks]
}

export default class WalletConnectProviderV2 {
  _web3Connect = null

  private _hooks: Web3ReactHooks | WalletConnectV2
  private _walletConnectV2: Web3ReactHooks | WalletConnectV2
  
  constructor(web3Connect, options) {
    //super(options)
    console.log('WalletConnectProviderV2 create')
    this._web3Connect = web3Connect
    const [walletConnectV2, hooks] = initConnector(1)
    this._hooks = hooks
    this._walletConnectV2 = walletConnectV2
    console.log('>>>', hooks)
    console.log('>>>', walletConnectV2)
    //@ts-ignore
    walletConnectV2.events.on(URI_AVAILABLE, (uri: string) => {
      console.log(`walletConnectV2 uri: ${uri}`)
    })
    //@ts-ignore
    walletConnectV2.activate(1)
    //@ts-ignore
    window.testWC = this
  }

  getAccount() {
    // @ts-ignore
    return this._walletConnectV2.provider.accounts[0]
  }
  getChainId() {
    // @ts-ignore
    return this._walletConnectV2.provider.chainId
  }
  getProvider() {
    // @ts-ignore
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

  async Connect() {
  /*
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
    */
  }
}
/*
export default class WalletConnectProviderV2 extends WalletConnectConnector {
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
*/