import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'
import { constants } from 'helpers'

import Link from 'sw-valuelink'

import CSSModules from 'react-css-modules'
import styles from './ConfirmBeginSwap.scss'

import { Modal } from 'components/modal'
import { Button, Toggle } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import typeforce from 'swap.app/util/typeforce'

import config from 'app-config'

const isDark = localStorage.getItem(constants.localStorage.isDark)

const defaultLanguage = defineMessages({
  title: {
    id: 'confirmDialogDefaultTitle',
    defaultMessage: 'Confirm action',
  },
  message: {
    id: 'confirmDialogDefaultMessage',
    defaultMessage: 'Confirm action on this site?',
  },
  yes: {
    id: 'confirmDialogDefaultYes',
    defaultMessage: 'Yes',
  },
  no: {
    id: 'confirmDialogDefaultNo',
    defaultMessage: 'No',
  },
})

@injectIntl
@connect(({
  user: { ethData, btcData, ghostData, tokensData },
}) => ({
  currenciesData: [ethData, btcData, ghostData],
  tokensData: [...Object.keys(tokensData).map(k => (tokensData[k]))],
}))
@CSSModules(styles, { allowMultiple: true })
export default class ConfirmBeginSwap extends React.Component {

  static propTypes = {
    onAccept: PropTypes.func,
  }

  constructor({ tokensData, currenciesData }) {
    super()

    this.wallets = {}
    currenciesData.forEach(item => {
      this.wallets[item.currency] = item.address
    })
    tokensData.forEach(item => {
      this.wallets[item.currency] = item.address
    })

    this.state = {
      customWalletUse: false,
    }
  }

  customWalletIsValid() {
    const { customWallet, customWalletUse } = this.state
    const { sellCurrency } = this.props.data.order

    if (customWalletUse) {
      if (!typeforce.isCoinAddress[sellCurrency]) {
        console.warn(`Swap.Core unkrown isCoinAddress check for ${sellCurrency}`)
        return true
      }
      return typeforce.isCoinAddress[sellCurrency](customWallet)
    } else return true
  }

  customWalletAllowed() {
    const { buyCurrency, sellCurrency } = this.props.data.order

    if (buyCurrency === 'BTC') {
      // btc-token
      if (config.erc20[sellCurrency.toLowerCase()] !== undefined) return true
      // btc-eth
      if (sellCurrency === 'ETH') return true
      if (sellCurrency === 'GHOST') return true
    }
    if (config.erc20[buyCurrency.toLowerCase()] !== undefined) {
      // token-btc
      if (sellCurrency === 'BTC') return true
      if (sellCurrency === 'GHOST') return true
    }

    if (buyCurrency === 'ETH') {
      // eth-btc
      if (sellCurrency === 'BTC') return true
      if (sellCurrency === 'GHOST') return true
    }

    if (buyCurrency === 'GHOST') {
      // ghost-eth
      if (sellCurrency === 'ETH') return true
       // ghost-btc
      if (sellCurrency === 'BTC') return true
    }

    return false
  }

  getSystemWallet = (walletCurrency) => {
    const { sellCurrency } = this.props.data.order

    return this.wallets[(walletCurrency) ? walletCurrency.toUpperCase() : sellCurrency]
  }

  handleCustomWalletUse = () => {
    const { customWalletUse } = this.state

    const newCustomWalletUse = !customWalletUse

    this.setState({
      customWalletUse: newCustomWalletUse,
      customWallet: (newCustomWalletUse === false) ? '' : this.getSystemWallet(),
    })
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }

    actions.modals.close(name)
  }

  handleConfirm = () => {
    const { name, data, onAccept } = this.props
    const { customWalletUse, customWallet } = this.state

    if (!this.customWalletIsValid()) return

    actions.modals.close(name)

    if (typeof onAccept === 'function') {
      onAccept((customWalletUse) ? customWallet : null)
    }

    if (typeof data.onAccept === 'function') {
      data.onAccept((customWalletUse) ? customWallet : null)
    }
  }

  render() {
    const {
      intl,
      name,
      data: {
        title,
        message,
        labelYes,
        labelNo,
      },
    } = this.props

    const labels = {
      title: title || intl.formatMessage(defaultLanguage.title),
      message: message || intl.formatMessage(defaultLanguage.message),
      yes: labelYes || intl.formatMessage(defaultLanguage.yes),
      no: labelNo || intl.formatMessage(defaultLanguage.no),
    }

    const { customWalletUse, customWallet } = this.state
    const okStyle = (this.customWalletIsValid()) ? 'brand' : 'gray'

    const linked = Link.all(this, 'customWallet')

    return (
      <div styleName={`modal-overlay ${isDark ? '--dark' : ''}`}>
        <div styleName="modal">
          <div styleName="header">
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div styleName="notification-overlay">
              <p styleName="notification">{labels.message}</p>
            </div>
            {
              (this.customWalletAllowed()) && (
                <Fragment>
                  {
                    (!this.customWalletIsValid()) && (
                      <div styleName="error">
                        <FormattedMessage id="CustomWalletIsNotCorrect" defaultMessage="Wallet address is incorrect" />
                      </div>
                    )
                  }
                  <div styleName="walletToggle walletToggle_site">
                    <div styleName="walletOpenSide">
                      <Toggle checked={customWalletUse} onChange={this.handleCustomWalletUse} />
                      <span styleName="specify">
                        <FormattedMessage id="UseAnotherWallet" defaultMessage="Specify the receiving wallet address" />
                      </span>
                    </div>
                    <div styleName={customWalletUse ? 'anotherRecepient anotherRecepient_active' : 'anotherRecepient'}>
                      <div styleName="walletInput">
                        <Input required valueLink={linked.customWallet} pattern="0-9a-zA-Z" placeholder="Enter the receiving wallet address" />
                      </div>
                    </div>
                  </div>
                </Fragment>
              )
            }
            <div styleName="button-overlay">
              <Button styleName="button" gray onClick={this.handleClose}>{labels.no}</Button>
              {(this.customWalletIsValid()) && (
                <Button styleName="button" brand onClick={this.handleConfirm}>{labels.yes}</Button>
              )}
              {(!this.customWalletIsValid()) && (
                <Button styleName="button" gray>{labels.yes}</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
