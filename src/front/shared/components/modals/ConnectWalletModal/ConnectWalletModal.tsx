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
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import Coin from 'components/Coin/Coin'

const defaultLanguage = defineMessages({
  title: {
    id: 'ConnectWalletModal_Title',
    defaultMessage: 'Подключение внешего кошелька',
  },
  cancel: {
    id: 'ConnectWalletModal_Cancel',
    defaultMessage: 'Отмена',
  },
})

const providerTitles = defineMessages({
  INJECTED: {
    id: 'ConnectWalletModal_Injected',
    defaultMessage: 'Metamask',
  },
  WALLETCONNECT: {
    id: 'ConnectWalletModal_WalletConnect',
    defaultMessage: 'WalletConnect',
  },
})

@connect(({ ui: { dashboardModalsAllowed }, user }) => ({
  dashboardModalsAllowed,
  metamaskData: user.metamaskData,
}))
@cssModules(styles, { allowMultiple: true })
class ConnectWalletModal extends React.Component<any, any> {
  constructor(props) {
    super(props)

    this.state = {
      showBlockchainStep: false,
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
        //@ts-ignore: strictNullChecks
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

  handleWalletConnect = (chainId) => {
    metamask.web3connect.connectTo(SUPPORTED_PROVIDERS.WALLETCONNECT).then((connected) => {
      this.onConnectLogic(connected)
    })
  }

  choseBlockchain = () => {
    this.setState(() => ({
      showBlockchainStep: true,
    }))
  }

  render() {
    const { intl, dashboardModalsAllowed, metamaskData } = this.props
    const { showBlockchainStep } = this.state

    const labels = {
      title: intl.formatMessage(defaultLanguage.title),
      cancel: intl.formatMessage(defaultLanguage.cancel),
    }

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
            {/*
            //@ts-ignore */}
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div styleName="notification-overlay">
              <div styleName="providers">
                {metamask.web3connect.isInjectedEnabled() && (
                  <div styleName="provider_row">
                    <Button styleName="button_provider" brand onClick={this.handleInjected}>
                      {metamask.web3connect.getInjectedTitle()}
                    </Button>
                  </div>
                )}
                <div styleName="provider_row">
                  <Button styleName="button_provider" brand onClick={this.choseBlockchain}>
                    <FormattedMessage {...providerTitles.WALLETCONNECT} />
                  </Button>
                </div>
              </div>

              <div styleName={`blockchains ${showBlockchainStep ? '' : 'disabled'}`}>
                <h3>
                  <FormattedMessage
                    id="availableBlockchains"
                    defaultMessage="Available blockchains"
                  />
                  {':'}
                </h3>

                <div styleName="optionsWrapper">
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
                          onClick={() => this.handleWalletConnect(item.chainId)}
                        >
                          <Coin size={30} name={metamaskData.currency.toLowerCase()} />

                          <span styleName="chainName">{item.chainName}</span>
                        </button>
                      )
                    }
                  )}
                </div>
              </div>
            </div>
            <div styleName="button-overlay">
              <Button styleName="button" blue onClick={this.handleClose}>
                {labels.cancel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
//@ts-ignore: strictNullChecks
export default injectIntl(ConnectWalletModal)
