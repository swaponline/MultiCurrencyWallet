import React from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'
import actions from 'redux/actions'
import Link from 'local_modules/sw-valuelink'

import CSSModules from 'react-css-modules'
import styles from './ConfirmBeginSwap.scss'

import { Button, Toggle } from 'components/controls'
import { Input } from 'components/forms'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import typeforce from 'swap.app/util/typeforce'

import config from 'app-config'

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

@connect(({
  user: {
    ethData,
    bnbData,
    maticData,
    arbethData,
    btcData,
    ghostData,
    nextData,
    tokensData,
  },
}) => ({
  currenciesData: [
    ethData, 
    bnbData, 
    maticData,
    arbethData, 
    btcData, 
    ghostData, 
    nextData,
  ],
  tokensData: [...Object.keys(tokensData).map(k => (tokensData[k]))],
}))
@CSSModules(styles, { allowMultiple: true })
class ConfirmBeginSwap extends React.Component<any, any> {
  static propTypes = {
    onAccept: PropTypes.func,
  }

  systemWallets: any

  constructor(props) {
    super(props)

    const { tokensData, currenciesData } = props

    this.systemWallets = {}

    const coinsData = [...currenciesData, ...tokensData]
    coinsData.forEach(item => {
      if (item.currency && item.address) {
        this.systemWallets[item.currency.toUpperCase()] = item.address
      }
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
        console.warn(`Swap.Core unknown isCoinAddress check for ${sellCurrency}`)
        return true
      }
      return typeforce.isCoinAddress[sellCurrency](customWallet)
    }
    return true
  }

  customWalletAllowed() {

    return false // temporary disable custom address

    /*const { buyCurrency, sellCurrency } = this.props.data.order

    if (buyCurrency === 'BTC') {
      // btc-token
      if (config.erc20[sellCurrency.toLowerCase()] !== undefined) return true
      // btc-eth
      if (sellCurrency === 'ETH') return true
      if (sellCurrency === 'GHOST') return true
      if (sellCurrency === 'NEXT') return true
    }
    if (config.erc20[buyCurrency.toLowerCase()] !== undefined) {
      // token-btc
      if (sellCurrency === 'BTC') return true
      if (sellCurrency === 'GHOST') return true
      if (sellCurrency === 'NEXT') return true
    }

    if (buyCurrency === 'ETH') {
      // eth-btc
      if (sellCurrency === 'BTC') return true
      if (sellCurrency === 'GHOST') return true
      if (sellCurrency === 'NEXT') return true
    }

    if (buyCurrency === 'GHOST') {
      // ghost-eth
      if (sellCurrency === 'ETH') return true
       // ghost-btc
      if (sellCurrency === 'BTC') return true
    }

    if (buyCurrency === 'NEXT') {
      // next-eth
      if (sellCurrency === 'ETH') return true
       // next-btc
      if (sellCurrency === 'BTC') return true
    }

    return false*/
  }

  handleCustomWalletUse = () => {
    const { customWalletUse } = this.state

    const newCustomWalletUse = !customWalletUse

    const { sellCurrency } = this.props.data.order
    const sellTicker = sellCurrency.toUpperCase()
    const sellWalletAddress = this.systemWallets[sellTicker]

    this.setState({
      customWalletUse: newCustomWalletUse,
      customWallet: (newCustomWalletUse === false) ? '' : sellWalletAddress,
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

    if (!this.customWalletIsValid()) {
      return
    }

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
      <div styleName="modal-overlay">
        <div styleName="modal">
          <div styleName="header">
            {/*
            //@ts-ignore */}
            <WidthContainer styleName="headerContent">
              <div styleName="title">{labels.title}</div>
            </WidthContainer>
          </div>
          <div styleName="content">
            <div styleName="content-inner">
              <p styleName="notification">{labels.message}</p>

              {this.customWalletAllowed()
                ?
                <div>
                  {
                    (!this.customWalletIsValid()) && (
                      <div styleName="error">
                        <FormattedMessage id="CustomWalletIsNotCorrect" defaultMessage="Wallet address is incorrect" />
                      </div>
                    )
                  }
                  <div styleName="walletToggle walletToggle_site">
                    <div styleName="walletOpenSide">
                      {/*
                      //@ts-ignore */}
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
                </div>
                :
                <div>
                  <FormattedMessage id="ConfirmBeginSwapOnlyInternal" defaultMessage="Acceptance of an offer from the offerbook is temporarily possible only for internal addresses" />
                </div>
              }
            </div>
          </div>
          <div styleName="buttons">
            <Button styleName="button" gray onClick={this.handleClose}>{labels.no}</Button>
            {(this.customWalletIsValid()) && (
              <Button styleName="button" blue onClick={this.handleConfirm}>{labels.yes}</Button>
            )}
            {(!this.customWalletIsValid()) && (
              <Button styleName="button" disabled>{labels.yes}</Button>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default injectIntl(ConfirmBeginSwap)
