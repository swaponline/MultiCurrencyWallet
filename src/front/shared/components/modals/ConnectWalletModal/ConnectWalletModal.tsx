import React from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import cssModules from 'react-css-modules'
import cx from 'classnames'
import styles from './ConnectWalletModal.scss'
import { externalConfig } from 'helpers'
import SUPPORTED_PROVIDERS from 'common/web3connect/providers/supported'
import { constants, links, metamask } from 'helpers'
import { localisedUrl } from 'helpers/locale'
import { Button } from 'components/controls'
import Coin from 'components/Coin/Coin'

@connect(({ ui: { dashboardModalsAllowed } }) => ({
  dashboardModalsAllowed,
}))
@cssModules(styles, { allowMultiple: true })
class ConnectWalletModal extends React.Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      choseNetwork: false,
    }
  }

  goToPage(link) {
    const {
      name,
      history,
      intl: { locale },
    } = this.props
    history.push(localisedUrl(locale, link))
  }

  onConnectLogic(connected) {
    const {
      name,
      data: { dontRedirect, onResolve },
    } = this.props

    if (connected) {
      if (!dontRedirect) this.goToPage(links.home)
      if (typeof onResolve === `function`) {
        onResolve(true)
      }
      actions.modals.close(name)
    }
  }

  handleClose = () => {
    const {
      name,
      data: { dontRedirect, onResolve },
    } = this.props

    if (!dontRedirect) {
      if (!localStorage.getItem(constants.localStorage.isWalletCreate)) {
        this.goToPage(links.createWallet)
      } else {
        this.goToPage(links.home)
      }
    }
    if (typeof onResolve === `function`) {
      onResolve(false)
    }
    actions.modals.close(name)
  }

  handleInjected = () => {
    metamask.web3connect.connectTo(SUPPORTED_PROVIDERS.INJECTED).then((connected) => {
      if (!connected && metamask.web3connect.isLocked()) {
        actions.modals.open(constants.modals.AlertModal, {
          message: (
            <FormattedMessage
              id="ConnectWalletModal_WalletLocked"
              defaultMessage="Wallet is locked. Unlock the wallet first."
            />
          ),
        })
      }

      this.onConnectLogic(connected)
    })
  }

  handleWalletConnect = () => {
    metamask.web3connect.connectTo(SUPPORTED_PROVIDERS.WALLETCONNECT).then((connected) => {
      this.onConnectLogic(connected)
    })
  }

  setNetwork = (coinName) => {
    metamask.setWeb3connect(coinName)

    this.setState(() => ({
      choseNetwork: true,
    }))
  }

  render() {
    const { intl, dashboardModalsAllowed } = this.props
    const { choseNetwork } = this.state

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
          <div>
            {/*this.handleClose*/}
          </div>

          <div styleName="notification-overlay">
            <div styleName="stepWrapper">
              <h3 styleName="title">
                <FormattedMessage id="chooseNetwork" defaultMessage="Choose Network" />
              </h3>
              <div styleName="options">
                {Object.values(externalConfig.evmNetworks).map(
                  (
                    item: {
                      currency: string
                      chainId: number
                      networkVersion: number
                      chainName: string
                      rpcUrls: string[]
                      blockExplorerUrls: string[]
                    },
                    index
                  ) => {
                    return (
                      <button
                        key={index}
                        styleName="option"
                        onClick={() => this.setNetwork(item.currency)}
                      >
                        <Coin size={50} name={item.currency.toLowerCase()} />

                        <span styleName="chainName">{item.chainName.split(' ')[0]}</span>
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            <div styleName={`stepWrapper ${choseNetwork ? '' : 'disabled'}`}>
              <h3 styleName="title">
                <FormattedMessage id="chooseWallet" defaultMessage="Choose wallet" />
              </h3>
              <div styleName="options">
                {metamask.web3connect.isInjectedEnabled() && (
                  <div styleName="provider_row">
                    <Button styleName="button_provider" brand onClick={this.handleInjected}>
                      {metamask.web3connect.getInjectedTitle()}
                    </Button>
                  </div>
                )}
                <div styleName="provider_row">
                  <Button styleName="button_provider" brand onClick={this.handleWalletConnect}>
                    <FormattedMessage id="ConnectWalletModal_WalletConnect" defaultMessage="WalletConnect" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/*<div styleName="button-overlay">
            <Button styleName="button" gray onClick={this.handleClose}>
              <FormattedMessage id="ConnectWalletModal_Cancel" defaultMessage="Cancel" />
            </Button>
          </div>
*/}        </div>
      </div>
    )
  }
}
//@ts-ignore: strictNullChecks
export default injectIntl(ConnectWalletModal)
