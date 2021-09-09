import React from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './WalletConnectAccount.scss'

import {
  metamask,
  externalConfig as config
} from 'helpers'

import { Button } from 'components/controls'
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
  metamask.handleDisconnectWallet()
  this.handleClose()
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
    console.log('config.evmNetworks', config.evmNetworks)

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
              <p>Address: {address} </p>
              <p>Balance: {`${balance} ${currency}`} </p>
              <p>Network: {config.evmNetworks[currency].chainName}</p>
              <p>Wallet: {web3Type}</p>
            </div>
            <div styleName="button-overlay">
              {
                isConnected ? (
                  <Button blue onClick={this.handleDisconnect}>
                    <FormattedMessage id="MetamaskDisconnect" defaultMessage="Disconnect wallet" />
                  </Button>
                ) : (
                  <Button blue onClick={this.handleConnect}>
                    <FormattedMessage id="ConnectWeb3Wallet" defaultMessage="Сonnect Wallet" />
                  </Button>
                )
              }
              <Button blue onClick={this.handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WalletConnectAccount
