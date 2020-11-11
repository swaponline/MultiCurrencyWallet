import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'

export default class Wa
const walletconnect = new WalletConnectConnector({
  rpc,
  bridge: `https://bridge.walletconnect.org`,
  qrcode: true,
  pollingInterval: 12000,
})
walletconnect.isConnected = async () => {
  try {
    const address = await walletconnect.getAccount()
    return (address) ? true : false
  } catch (err) {
    return false
  }
}