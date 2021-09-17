import React from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './WalletConnectAccount.scss'
import { AddressFormat, AddressType } from 'domain/address'

import {
  metamask,
  externalConfig as config
} from 'helpers'

import { Button } from 'components/controls'
import Address from 'components/ui/Address/Address'
import Copy from 'components/ui/Copy/Copy'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'


@connect(({
  ui: { dashboardModalsAllowed },
  user: { metamaskData }
}) => ({
  dashboardModalsAllowed,
  metamaskData,
}))
@cssModules(styles, { allowMultiple: true })
class WalletConnectAccount extends React.Component<any, null> {

  handleClose = () => {
    const {
      name,
    } = this.props

    actions.modals.close(name)
  }

  handleConnect = () => {
    metamask.handleConnectMetamask({
      dontRedirect: true,
    })
  }

  handleDisconnect = () => {
    metamask.handleDisconnectWallet(this.handleClose)
  }

  render() {
    const {
        dashboardModalsAllowed,
        metamaskData: {
          isConnected,
          address,
          balance,
          currency,
        },
    } = this.props

    const web3Type = metamask.web3connect.getInjectedType()
    const isAvailableNetwork = metamask.isAvailableNetwork()

    const walletAddress = isAvailableNetwork ?
      (
        <Copy text={address}>
          <span>
            <Address
              address={address}
              format={AddressFormat.Full}
              type={AddressType.Metamask}
            />
          </span>
        </Copy>
      ) :
      <FormattedMessage id="incorrectNetwork" defaultMessage='Please choose correct network' />

    const walletBalance = isAvailableNetwork ?
      `${balance} ${currency}` :
      '0'

    const chainName = isAvailableNetwork ?
      config.evmNetworks[currency].chainName :
      <FormattedMessage id="UnknownNetworkConnectedWallet" defaultMessage="Unknown Network" />

    return (
      <div styleName={`modal-overlay ${dashboardModalsAllowed ? "modal-overlay_dashboardView" : ""}`}>
        <div styleName={`modal ${dashboardModalsAllowed ? "modal_dashboardView" : ""}`}>
          <div styleName="header">
            {/*//@ts-ignore */}
            <WidthContainer styleName="headerContent">
              <div styleName="title">
                <FormattedMessage
                  id="WalletConnectAccountTitle"
                  defaultMessage="CONNECTED ACCOUNT"
                />
              </div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div>
              <p>
                <FormattedMessage id="YourWalletbalance" defaultMessage="Balance" />: {walletBalance}
              </p>
              <p><FormattedMessage id="network" defaultMessage="Network" />: {chainName}</p>
              <p><FormattedMessage id="menu.wallet" defaultMessage="Wallet" />: {web3Type}</p>
            </div>
            <span styleName="walletAddress">{walletAddress}</span>
            <div styleName="button-overlay">
              {
                isConnected ? (
                  <Button blue onClick={this.handleDisconnect}>
                    <FormattedMessage id="MetamaskDisconnect" defaultMessage="Disconnect wallet" />
                  </Button>
                ) : (
                  <Button blue onClick={this.handleConnect}>
                    <FormattedMessage id="Exchange_ConnectAddressOption" defaultMessage="Connect Wallet" />
                  </Button>
                )
              }
              <Button blue onClick={this.handleClose}>
                <FormattedMessage id="WithdrawModalCancelBtn" defaultMessage="Cancel" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WalletConnectAccount
