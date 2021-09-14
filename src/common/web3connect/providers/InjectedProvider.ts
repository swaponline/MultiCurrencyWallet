import { InjectedConnector } from '@web3-react/injected-connector'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'


export default class InjectedProvider extends InjectedConnector {
  _web3Connect = null
  _isLocked = false

  constructor(web3Connect, options) {
    super(options)
    this._web3Connect = web3Connect
  }

  async isConnected() {
    // This is opera
    if ((!!window.opr && !!window.opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
      await window.ethereum?.enable()

      return window.ethereum?.isConnected()
    } else if (window.ethereum?.isTrust) {
      return window.ethereum.ready
    } else {
      return await super.isAuthorized()
    }
  }

  isLocked() {
    return this._isLocked
  }

  async Disconnect() {
    await this.deactivate()
  }

  async Connect() {
    this._isLocked = false
    try {
      const connection = await super.activate()
      return (connection) ? true : false
    } catch (err) {
      if (err instanceof UserRejectedRequestErrorInjected) {
        console.warn('User reject connect to Injected provider')
      } else if (err instanceof NoEthereumProviderError) {
        console.warn('There no injected provider')
      } else if (/Wallet is locked/.test(err.message)) {
        this._isLocked = true
        console.warn('Wallet locked')
      } else {
        console.error(err)
      }
      return false
    }
  }
}