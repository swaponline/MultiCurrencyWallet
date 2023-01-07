import React from 'react'
import { connect } from 'redaction'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import erc20Like from 'common/erc20Like'
import styles from './CurrencyAction.scss'
import { constants } from 'helpers'

import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import CurrencyIcon from 'components/ui/CurrencyIcon/CurrencyIcon'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import icons from 'components/ui/CurrencyIcon/images'
import config from 'app-config'
import actions from 'shared/redux/actions'

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

    const { currency, address, standard, tokenKey } = item

    if (context === 'Deposit') {
      this.handleClose()

      actions.modals.open(constants.modals.ReceiveModal, {
        currency: (tokenKey || currency),
        address,
        standard,
      })
    } else {
      let targetCurrency = currency
      switch (currency.toLowerCase()) {
        case 'btc (multisig)':
        case 'btc (pin-protected)':
          targetCurrency = 'btc'
          break
      }

      this.handleClose()

      history.push(
        localisedUrl(locale, (tokenKey ? '/token' : '') + `/${(tokenKey || targetCurrency)}/${address}/send`)
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
              {currencies.map((item, index) => {
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

                if (!icons[iconName] && item.standard && item.baseCurrency) {
                  iconName = item.baseCurrency
                }

                let renderIcon = icons[iconName]
                let renderStyle = {
                  backgroundColor: '',
                }

                const tokenStandard = item.standard?.toLowerCase()
                const currencyKey = item.currency.toLowerCase()

                if (tokenStandard && config[tokenStandard][currencyKey]) {
                  const token = config[tokenStandard][currencyKey]

                  if (token.icon) {
                    renderIcon = token.icon
                  }
                  if (token.iconBgColor) {
                    renderStyle.backgroundColor = token.iconBgColor
                  }
                }

                return (
                  <div styleName="card" key={index} onClick={() => this.handleClickCurrency(item)}>
                    <CurrencyIcon
                      styleName="circle"
                      name={itemTitle}
                      source={renderIcon && renderIcon}
                      style={renderStyle}
                    />
                    <div styleName="info">
                      <p>{itemTitle}</p>
                      <span>{itemFullTitle}</span>
                    </div>
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
