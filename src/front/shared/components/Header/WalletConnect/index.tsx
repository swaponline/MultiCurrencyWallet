import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'

import Coin from 'components/Coin/Coin'
import Address from 'components/ui/Address/Address'
import { AddressFormat } from 'domain/address'

import { metamask, constants } from 'helpers'
import actions from 'redux/actions'
import styles from './index.scss'
import config from 'helpers/externalConfig'

function WalletConnect(props) {
  const {
    metamaskData,
  } = props

  const isMetamaskConnected = metamaskData.isConnected

  const web3Type = metamask.web3connect.getInjectedType()
  const isNotAvailableMetamaskNetwork = isMetamaskConnected && !metamask.isAvailableNetwork()
  const disconnectedOrNetworkNotAvailable = !isMetamaskConnected || isNotAvailableMetamaskNetwork

  if (web3Type == 'NONE' && !config.opts.hasWalletConnect) return null

  const connectWallet = () => {
    metamask.handleConnectMetamask({
      dontRedirect: true,
    })
  }

  const disconnectWallet = async () => {
    await metamask.disconnect()
  }

  const openWalletConnectAccountModal = () => {
    actions.modals.open(constants.modals.WalletConnectAccount)
  }

  const currencyName = metamaskData.currency.toLowerCase()

  return (
    <div
      id="connect-wallet"
      styleName="connectWallet"
      onClick={
        isMetamaskConnected
          ? (isNotAvailableMetamaskNetwork
            ? disconnectWallet
            : openWalletConnectAccountModal)
          : connectWallet
      }
    >
      {disconnectedOrNetworkNotAvailable
        ? (
          <Coin
            size={40}
            name={web3Type}
          />
        )
        : (
          <Coin
            size={30}
            name={currencyName}
          />
        )}
      <span styleName={`connectWalletText ${disconnectedOrNetworkNotAvailable ? '' : 'hasCoinIcon'}`}>
        {isNotAvailableMetamaskNetwork
          ? <FormattedMessage id="UnknownNetworkConnectedWallet" defaultMessage="Unknown Network" />
          : isMetamaskConnected
            ? (
              <Address
                address={metamaskData.address}
                format={AddressFormat.Short}
              />
            )
            : <FormattedMessage id="Exchange_ConnectAddressOption" defaultMessage="Connect Wallet" />}
      </span>
    </div>
  )
}

export default connect(
  ({
    user,
  }) => ({
    metamaskData: user.metamaskData,
  }),
)(cssModules(WalletConnect, styles, { allowMultiple: true }))
