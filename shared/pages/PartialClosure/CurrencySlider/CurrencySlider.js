import React, { Component, Fragment } from 'react'

import styles from './CurrencySlider.scss'
import cssModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'

import btc from './images/btc.svg'
import eth from './images/eth.svg'
import usdt from './images/usdt.svg'
import ltc from './images/ltc.svg'


@cssModules(styles, { allowMultiple: true })
export default class CurrencySlider extends Component {
  render() {
    return (
      <Fragment>
        <div>
          <h3 styleName="availableCurrencies">
            <FormattedMessage id="CurrencySlider19" defaultMessage="Already available for exchange" />
          </h3>
          <div styleName="currencyListWrap">
            <ul styleName="currencyList">
              <li styleName="currencyListItem currencyListItemBtc"><img src={btc} alt="" /></li>
              <li styleName="currencyListItem currencyListItemEth"><img src={eth} alt="" /></li>
              <li styleName="currencyListItem"><img src={usdt} alt="" /></li>
              <li styleName="currencyListItem"><img src={ltc} alt="" /></li>
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
