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
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

type ComponentState = {
  isPending: boolean
  balanceUpdating: boolean
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
      balanceUpdating: false,
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
          isPending: false,
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

  updateBalance = async () => {
    const { metamaskData } = this.props

    this.setState(() => ({
      balanceUpdating: true,
    }))

    await actions[metamaskData.currency.toLowerCase()].getBalance()

    setTimeout(() => {
      this.setState(() => ({
        balanceUpdating: false,
      }))
    }, 300)
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

    const { isPending, balanceUpdating } = this.state

    const web3Type = metamask.web3connect.getProviderType()
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
      <div styleName={`modalOverlay ${dashboardModalsAllowed ? "modalOverlay_dashboardView" : ""}`}>
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
              <div styleName="parameter">
                <FormattedMessage id="YourWalletbalance" defaultMessage="Balance" />:{' '}
                {isPending ? (
                  '-'
                ) : (
                  <>
                    <button styleName="updateBalanceButton" onClick={this.updateBalance}>
                      <i className="fas fa-sync-alt" />
                    </button>
                    {balanceUpdating ? (
                      <span styleName="balanceLoader"><InlineLoader /></span>
                    ) : (
                      <span styleName="value">{walletBalance}</span>
                    )}
                  </>
                )}
              </div>
              <p styleName="parameter">
                <FormattedMessage id="network" defaultMessage="Network" />:{' '}
                {isPending ? '-' : <span styleName="value">{chainName}</span>}
              </p>
              <p styleName="parameter">
                <FormattedMessage id="menu.wallet" defaultMessage="Wallet" />:{' '}
                {isPending ? '-' : <span styleName="value">{web3Type}</span>}
              </p>
            </div>
            <span styleName="walletAddress">
              {isPending ? <InlineLoader /> : walletAddress}
            </span>
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
