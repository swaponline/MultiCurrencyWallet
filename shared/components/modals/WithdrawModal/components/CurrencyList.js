import React, { Component, Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './CurrencyList.scss'
import cx from 'classnames'
import Coin from 'components/Coin/Coin'
import PartOfAddress from 'pages/Wallet/components/PartOfAddress'
import { isMobile } from 'react-device-detect'
import helpers, { constants, links, request } from 'helpers'
import actions from 'redux/actions'
import { localisedUrl } from 'helpers/locale'


@cssModules(styles, { allowMultiple: true })
export default class CurrencyList extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      isAssetsOpen: false,
    }
  }

  openModal = (currency, address) => {
    this.setState({
      isAssetsOpen: false,
    }, () => {
      const {
        history,
        intl: { locale },
      } = this.props

      const currentAsset = actions.core.getWallets().filter((item) => currency === item.currency && address.toLowerCase() === item.address.toLowerCase())

      let targetCurrency = currentAsset[0].currency

      switch (currency.toLowerCase()) {
        case 'btc (multisig)':
        case 'btc (sms-protected)':
        case 'btc (pin-protected)':
          targetCurrency = 'btc'
          break
      }

      const isToken = helpers.ethToken.isEthToken({ name: currency })

      history.push(
        localisedUrl(locale, (isToken ? '/token' : '') + `/${targetCurrency}/${currentAsset[0].address}/send`)
      )
    })
  }

  render() {
    const {
      currentActiveAsset,
      currentBalance,
      currency,
      exCurrencyRate,
      activeFiat,
      tableRows,
      currentAddress,
    } = this.props

    const {
      isAssetsOpen,
    } = this.state

    return (
      <>
        <div
          styleName="customSelectValue"
          onClick={() => this.setState(({ isAssetsOpen }) => ({ isAssetsOpen: !isAssetsOpen }))}
        >
          <div styleName="coin">
            <Coin name={currentActiveAsset.currency} />
          </div>
          <div>
            <a>{currentActiveAsset.currency}</a>
            <span styleName="address">{currentAddress}</span>
            <span styleName="mobileAddress">
              {isMobile ? <PartOfAddress address={currentAddress} withoutLink /> : ''}
            </span>
          </div>
          <div styleName="amount">
            <span styleName="currency">
              {currentBalance} {currency}
            </span>
            <span styleName="usd">
              {(currentActiveAsset.infoAboutCurrency && currentActiveAsset.currencyRate)
                ? (currentBalance * currentActiveAsset.currencyRate).toFixed(2)
                : (currentBalance * exCurrencyRate).toFixed(2)}{' '}
              {activeFiat}
            </span>
          </div>
          <div styleName={cx('customSelectArrow', { active: isAssetsOpen })}></div>
        </div>
        {isAssetsOpen && (
          <div styleName="customSelectList">
            {tableRows.map((item, index) => (
              <div key={index}
                styleName={cx('customSelectListItem customSelectValue', {
                  disabled: item.balance === 0,
                })}
                onClick={() => {
                  this.openModal(item.currency, item.address)
                }}
              >
                <Coin name={item.currency} />
                <div>
                  <a>{item.fullName}</a>
                  <span styleName="address">{item.address}</span>
                  <span styleName="mobileAddress">
                    {isMobile ? <PartOfAddress address={item.address} withoutLink /> : ''}
                  </span>
                </div>
                <div styleName="amount">
                  <span styleName="currency">
                    {item.balance} {item.currency}
                  </span>
                  <span styleName="usd">
                    {(item.infoAboutCurrency && item.currencyRate)
                      ? (item.balance * item.currencyRate).toFixed(2)
                      : (item.balance * exCurrencyRate).toFixed(2)}{' '}
                    {activeFiat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }
}

