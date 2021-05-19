import React from 'react'
import { connect } from 'redaction'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import erc20Like from 'common/erc20Like'
import styles from './CurrencyAction.scss'
import { constants } from 'helpers'

import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import icons from 'components/ui/CurrencyIcon/images'
import config from 'app-config'
import actions from 'shared/redux/actions'

const isDark = localStorage.getItem(constants.localStorage.isDark)

@connect(({
  ui: { dashboardModalsAllowed },
}) => ({
  dashboardView: dashboardModalsAllowed,
}))
@cssModules(styles, { allowMultiple: true })
class CurrencyAction extends React.Component<any, any> {
  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }
    //@ts-ignore
    actions.modals.close(name)
  }

  handleClickCurrency = (item) => {
    const {
      data: { context },
      history,
      intl: { locale },
    } = this.props

    const { currency, address } = item
    const isToken = erc20Like.isToken({ name: currency })

    if (context === 'Deposit') {
      this.handleClose()
      //@ts-ignore
      actions.modals.open(constants.modals.ReceiveModal, {
        currency,
        address,
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

      this.handleClose()

      history.push(
        localisedUrl(locale, (isToken ? '/token' : '') + `/${targetCurrency}/${address}/send`)
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
    }

    return (
      <div styleName={cx({
        "modal-overlay": true,
        "modal-overlay_dashboardView": dashboardView,
        "dark": isDark,
      })}>
        <div styleName={cx({
          "modal": true,
          "modal_dashboardView": dashboardView
        })}>
          <div styleName="header">
            <p styleName="title">{context}</p>
            {/*
            //@ts-ignore */}
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
                  case 'BTC (PIN-Protected)':
                    iconName = 'btc'
                    itemTitle = 'BTC (PIN)'
                    itemFullTitle = 'BTC (PIN)'
                    break
                }

                if (!icons[iconName] || !styles[iconName]) {
                  iconName = 'eth' // prevent styles fail for unknown asset

                  if (item.standard === 'erc20') {
                    iconName = 'eth'
                  } else if (item.standard === 'bep20') {
                    iconName = 'bnb'
                  }
                }

                let renderIcon = icons[iconName]
                let renderStyle = {
                  backgroundColor: null,
                }
                if (config && config.erc20 && config.erc20[item.currency.toLowerCase()]) {
                  if (config.erc20[item.currency.toLowerCase()].icon)
                    renderIcon = config.erc20[item.currency.toLowerCase()].icon
                  if (config.erc20[item.currency.toLowerCase()].iconBgColor) {
                    renderStyle.backgroundColor = config.erc20[item.currency.toLowerCase()].iconBgColor
                  }
                }
                return (
                  <div styleName="card" key={item.currency} onClick={() => this.handleClickCurrency(item)}>
                    {/* @ts-ignore: strictNullChecks */}
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

export default injectIntl(CurrencyAction)
