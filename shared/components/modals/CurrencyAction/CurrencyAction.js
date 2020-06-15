import React from 'react'
import { connect } from 'redaction'
import CopyToClipboard from 'react-copy-to-clipboard'
import cx from 'classnames'

import cssModules from 'react-css-modules'

import styles from './CurrencyAction.scss'
import helpers, { links, constants } from 'helpers'
import Coin from 'components/Coin/Coin'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { ConsoleView } from 'react-device-detect'
import { relocalisedUrl, localisedUrl } from 'helpers/locale'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import icons from './images'
import config from 'app-config'

const title = defineMessages({
  CurrencyAction: {
    id: 'CurrencyAction',
    defaultMessage: 'CurrencyAction'
  }
})

@injectIntl
@connect(({
  ui: { dashboardModalsAllowed },
}) => ({
  dashboardView: dashboardModalsAllowed,
}))
@cssModules(styles, { allowMultiple: true })
export default class CurrencyAction extends React.Component {

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

  handleClickCurrency = item => {
    const {
      name,
      data: { context },
      history,
      intl: { locale },
    } = this.props


    const { currency, address } = item

    if (context === 'Deposit') {
      this.handleClose()

      actions.modals.open(constants.modals.ReceiveModal, {
        currency,
        address
      })
    } else {
      const { Withdraw, WithdrawMultisigSMS, WithdrawMultisigUser } = constants.modals

      let withdrawModalType = Withdraw
      if (item.currency === 'BTC (SMS-Protected)') withdrawModalType = WithdrawMultisigSMS
      if (item.currency === 'BTC (Multisig)') withdrawModalType = WithdrawMultisigUser

      let targetCurrency = currency
      switch (currency.toLowerCase()) {
        case 'btc (multisig)':
        case 'btc (sms-protected)':
        case 'btc (pin-protected)':
          targetCurrency = 'btc'
          break
      }

      const isToken = helpers.ethToken.isEthToken({ name: currency })
      this.handleClose()

      history.push(
        localisedUrl(
          locale,
          (isToken ? '/token' : '') + `/${targetCurrency}/${address}/send`
        )
      )
    }

  }

  render() {
    const {
      props: {
        data: { currencies, context },
        dashboardView,
      }
    } = this

    // if currencies is one, do autoselect
    if (currencies.length == 1) {
      this.handleClickCurrency(currencies.shift())
      //return
    }
    return (
      <div styleName={cx({
        "modal-overlay": true,
        "modal-overlay_dashboardView": dashboardView
      })}>
        <div styleName={cx({
          "modal": true,
          "modal_dashboardView": dashboardView
        })}>
          <div styleName="header">
            <p styleName="title">{context}</p>
            <CloseIcon styleName="closeButton" onClick={this.handleClose} data-testid="modalCloseIcon" />
          </div>
          <div styleName={cx({
            "content": true,
            "content_dashboardView": dashboardView
          })}>
            <p styleName="text">
              <FormattedMessage
                id="currencyAction81"
                defaultMessage="Please choose a currency, which you want to {context}"
                values={{ context: context.toLowerCase() }}
              />
            </p>
            <div styleName={cx({
              "currenciesWrapper": true,
              "currenciesWrapper_dashboardView": dashboardView
            })}>
              {currencies.map(item => {
                let iconName = item.currency.toLowerCase()
                let itemTitle = item.currency
                let itemFullTitle = item.fullName

                switch (item.currency) {
                  case 'BTC (Multisig)':
                    iconName = 'btc'
                    itemTitle = 'BTC (MTS)'
                    itemFullTitle = 'BTC (MTS)'
                    break
                  case 'BTC (SMS-Protected)':
                    iconName = 'btc'
                    itemTitle = 'BTC (SMS)'
                    itemFullTitle = 'BTC (SMS)'
                    break
                }

                if (!icons[iconName] || !styles[iconName]) {
                  iconName = 'eth' // Нужно нарисовать картинку для не известной валюты чтобы все это дело не падало в чертям из-за какой-то картинки-стиля, которых нет
                  if (config && config.isWidget) {
                    iconName = 'eth' // Нужно нарисовать картинку для erc20 токена
                  }
                }

                let renderIcon = icons[iconName]
                let renderStyle = {}
                if (config && config.erc20 && config.erc20[item.currency.toLowerCase()]) {
                  if (config.erc20[item.currency.toLowerCase()].icon)
                    renderIcon = config.erc20[item.currency.toLowerCase()].icon
                  if (config.erc20[item.currency.toLowerCase()].iconBgColor) {
                    renderStyle.backgroundColor = config.erc20[item.currency.toLowerCase()].iconBgColor
                  }
                }
                return (
                  <div styleName="card" key={item.currency} onClick={() => this.handleClickCurrency(item)}>
                    <div styleName={`circle ${iconName}`} style={renderStyle}>
                      <img src={renderIcon} alt={`${name} icon`} role="image" />
                    </div>
                    <b>{itemTitle}</b>
                    <span>{itemFullTitle}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
