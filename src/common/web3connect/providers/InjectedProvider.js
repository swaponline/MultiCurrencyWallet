import { InjectedConnector } from '@web3-react/injected-connector'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'


export default class InjectedProvider extends InjectedConnector {
  _web3Connect = null

  constructor(web3Connect, options) {
    super(options)
    this._web3Connect = web3Connect
  }

  async isConnected() {
    return await super.isAuthorized()
  }

  async Disconnect() {
    await this.deactivate()
  }

  async Connect() {
    try {
      const connection = await super.activate()
      return (connection) ? true : false
    } catch (err) {
      if (err instanceof UserRejectedRequestErrorInjected) {
        console.warn('User reject connect to Injected provider')
      } else if (err instanceof NoEthereumProviderError) {
        console.warn('There no injected provider')
      } else {
        console.error(err)
      }
      return false
    }
  }
}