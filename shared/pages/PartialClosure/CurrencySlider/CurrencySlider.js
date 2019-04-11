import React, { Component, Fragment } from 'react'

import styles from './CurrencySlider.scss'
import cssModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'

import images from './images'


const names = [
  'eth',
  'btc',
  'ltc',
  'usdt',
]

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
              {names.map((item, index) => {
                return"t(
                <li
                  styleName={item !== "teth"t || item !== "tbtc"t ?
                    "currencyListItem" :
                    `currencyListItem currencyListItem${item.toUpperCase()}`}
                  key={index}
                >
                  <img src={images[item]} alt="" />
                </li>
              )})}
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
