import React from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { FormattedMessage } from 'react-intl'
import cssModules from 'react-css-modules'
import cx from 'classnames'
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
@cssModules(styles)
class WalletConnectAccount extends React.Component<any, null> {

  handleClose = () => {
  const {
    name,
  } = this.props

  actions.modals.close(name)
  }

  handleDisconnect = () => {
  metamask.handleDisconnectWallet()
  this.handleClose()
  }

  render() {
    const {
        dashboardModalsAllowed,
        metamaskData
    } = this.props

    const web3Type = metamask.web3connect.getInjectedType()
    console.log('config.evmNetworks', config.evmNetworks)

    return (
      <div
        className={cx({
          [styles['modal-overlay']]: true,
          [styles['modal-overlay_dashboardView']]: dashboardModalsAllowed,
        })}
      >
        <div
          className={cx({
            [styles['modal']]: true,
            [styles['modal_dashboardView']]: dashboardModalsAllowed,
          })}
        >
          <div styleName="header">
            {/*//@ts-ignore */}
            <WidthContainer styleName="headerContent">
              <div styleName="title">
                <FormattedMessage
                  id="WalletConnectAccountTitle"
                  defaultMessage="WALLET ACCOUNT"
                />
              </div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div>
              <p>Address: {metamaskData.address} </p>
              <p>Balance: {`${metamaskData.balance} ${metamaskData.currency}`} </p>
              <p>Network: {config.evmNetworks[metamaskData.currency].chainName}</p>
              <p>Wallet: {web3Type}</p>
            </div>
            <div styleName="button-overlay">
              <Button blue onClick={this.handleDisconnect}>
                <FormattedMessage id="MetamaskDisconnect" defaultMessage="Disconnect wallet" />
              </Button>
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
