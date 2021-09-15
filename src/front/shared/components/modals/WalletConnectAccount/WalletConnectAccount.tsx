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
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'

type ComponentState = {
  isPending: boolean
}

@connect(({
  ui: { dashboardModalsAllowed },
  user: { metamaskData }
}) => ({
  dashboardModalsAllowed,
  metamaskData,
}))
@cssModules(styles, { allowMultiple: true })
class WalletConnectAccount extends React.Component<any, ComponentState> {
  constructor(props) {
    super(props)

    this.state = {
      isPending: false,
    }
  }

  handleClose = () => {
    const {
      name,
    } = this.props

    actions.modals.close(name)
  }

  handleConnect = () => {
    this.setState(() => ({
      isPending: true,
    }))

    metamask.handleConnectMetamask({
      callback: () => {
        this.setState(() => ({
          isPending: true,
        }))
      },
    })
  }

  handleDisconnect = () => {
    this.setState(() => ({
      isPending: true,
    }))

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

    const { isPending } = this.state

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
      <FormattedMessage id="pleaseChooseAnotherNetwork" defaultMessage="Please choose another network" />

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
            <div styleName="headerContent">
              <h3 styleName="title">
                <FormattedMessage
                  id="WalletConnectAccountTitle"
                  defaultMessage="CONNECTED ACCOUNT"
                />
              </h3>
              <CloseIcon onClick={this.handleClose} />
            </div>
          </div>
          <div styleName="content">
            <div styleName="infoWrapper">
              <p styleName="parameter">
                <FormattedMessage id="YourWalletbalance" defaultMessage="Balance" />:{' '}
                <span styleName="value">{walletBalance}</span>
              </p>
              <p styleName="parameter">
                <FormattedMessage id="network" defaultMessage="Network" />:{' '}
                <span styleName="value">{chainName}</span>
              </p>
              <p styleName="parameter">
                <FormattedMessage id="menu.wallet" defaultMessage="Wallet" />:{' '}
                <span styleName="value">{web3Type}</span>
              </p>
            </div>
            <span styleName="walletAddress">{walletAddress}</span>
            <div>
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
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WalletConnectAccount
