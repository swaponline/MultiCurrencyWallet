import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import cx from 'classnames'

import actions from 'redux/actions'
import { constants, links } from 'helpers'
import { localisedUrl } from 'helpers/locale'

import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './ConnectWalletModal.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'

import metamask from 'helpers/metamask'



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

@injectIntl
@connect(({ ui: { dashboardModalsAllowed }}) => ({
  dashboardModalsAllowed
}))
@cssModules(styles)
export default class ConnectWalletModal extends React.Component {
  goToPage(link) {
    const {
      name,
      history,
      intl: {
        locale,
      },
    } = this.props
    history.push(localisedUrl(locale, link))
  }

  onConnectLogic(connected) {
    const {
      name,
      data: {
        dontRedirect,
        onResolve,
      },
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
      data: {
        dontRedirect,
        onResolve,
      },
    } = this.props

    if (!localStorage.getItem(constants.localStorage.isWalletCreate)) {
      if (!dontRedirect) {
        this.goToPage(links.createWallet)
      }
    }
    if (typeof onResolve === `function`) {
      onResolve(false)
    }
    actions.modals.close(name)
  }

  handleInjected = () => {
    metamask.web3connect.connectTo('INJECTED').then((connected) => {
      if (!connected && metamask.web3connect.isLocked()) {
        actions.modals.open(constants.modals.AlertModal, {
          message: <FormattedMessage id="ConnectWalletModal_WalletLocked" defaultMessage="Wallet is locked. Unlock the wallet first." />,
        })
      }
      this.onConnectLogic(connected)
    })
  }

  handleWalletConnect = () => {
    metamask.web3connect.connectTo('WALLETCONNECT').then((connected) => {
      this.onConnectLogic(connected)
    })
  }

  render() {
    const {
      intl,
      name,
      dashboardModalsAllowed,
    } = this.props

    const labels = {
      title: intl.formatMessage(defaultLanguage.title),
      cancel: intl.formatMessage(defaultLanguage.cancel),
    }

    return (
      <div className={cx({
        [styles['modal-overlay']]: true,
        [styles['modal-overlay_dashboardView']]: dashboardModalsAllowed
      })}>
        <div className={cx({
          [styles.modal]: true,
          [styles.modal_dashboardView]: dashboardModalsAllowed
        })}>
          <div styleName="header">
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div styleName="notification-overlay">
              <div styleName="providers">
                {metamask.web3connect.isInjectedEnabled() && (
                  <div styleName="provider_row">
                    <Button styleName="button_provider" blue onClick={this.handleInjected}>
                      {metamask.web3connect.getInjectedTitle()}
                    </Button>
                  </div>
                )}
                <div styleName="provider_row">
                  <Button styleName="button_provider" blue onClick={this.handleWalletConnect}>
                    <FormattedMessage {...providerTitles.WALLETCONNECT} />
                  </Button>
                </div>
              </div>
            </div>
            <div styleName="button-overlay">
              <Button styleName="button" blue onClick={this.handleClose}>{labels.cancel}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
