import { InjectedConnector } from '@web3-react/injected-connector'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'

export default class InjectedProvider extends InjectedConnector {
  async isConnected() {
    return await super.isAuthorized()
  }
  async Connect() {
    try {
      const connection = await super.activate()
      return (connection) ? true : false
    } catch (err) {
      if (err instanceof UserRejectedRequestErrorInjected) {
        console.warn('User reject connect to Injected provider')
      }
      if (err instanceof NoEthereumProviderError) {
        console.warn('There no injected provider')
      }
      return false
    }
  }
}