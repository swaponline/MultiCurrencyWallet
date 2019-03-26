import React, { Component, Fragment } from 'react'

import styles from './CurrencySlider.scss'
import cssModules from 'react-css-modules'

import Coin from 'components/Coin/Coin'
import CurrencyIcon, { iconNames } from 'components/ui/CurrencyIcon/CurrencyIcon'


@cssModules(styles, { allowMultiple: true })
export default class CurrencySlider extends Component {
  render() {
    return (
      <Fragment>
        <div>
          <h3 styleName="availableCurrencies">
            Already available for exchange
          </h3>
          <div styleName="currencyListWrap">
            <ul styleName="currencyList">
              <li styleName="currencyListItem currencyListItemBtc"><CurrencyIcon name="btc" /></li>
              <li styleName="currencyListItem currencyListItemEth"><CurrencyIcon name="eth" /></li>
              <li styleName="currencyListItem"><CurrencyIcon name="usdt" /></li>
              <li styleName="currencyListItem"><CurrencyIcon name="ltc" /></li>
              <li styleName="currencyListItem currencyListItemEos"><CurrencyIcon name="eos" /></li>
            </ul>
            <a href="#" styleName="currencyAdd">
              +
            </a>
          </div>
        </div>
      </Fragment>
    )
  }
}
