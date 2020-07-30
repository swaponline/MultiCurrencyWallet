import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import { constants } from 'helpers'

import styles from './CurrencySlider.scss'
import cssModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'

import images from './images'

const tokens = window.widgetERC20Tokens ? Object.keys(window.widgetERC20Tokens) : ['swap']
const names = ['btc', 'eth', ...tokens]

const isDark = localStorage.getItem(constants.localStorage.isDark)

@connect(
  ({ currencies: { items: currencies } }) => ({
    currencies,
  })
)


@cssModules(styles, { allowMultiple: true })
export default class CurrencySlider extends Component {

  state = {
    children: [],
    activeItemIndex: 0,
  }

  render() {
    return (
      <Fragment>
        <div styleName={`block ${isDark ? 'dark' : ''}`}>
          <h3 styleName="availableCurrencies">
            <FormattedMessage id="CurrencySlider19" defaultMessage="Already available for exchange" />
          </h3>
          <div styleName="currencyListWrap">
            <ul styleName="currencyList">
              {names.map((item, index) => (
                <li styleName={item !== 'eth' ? 'currencyListItem' : 'currencyListItemEth'} key={index}>
                  <img src={tokens.includes(item) ? window.widgetERC20Tokens ? window.widgetERC20Tokens[item].icon : images[item] : images[item]} alt="" />
                </li>
              ))}
            </ul>
            {/* <a href="http://listing.swap.online" styleName="currencyAdd">
              <FormattedMessage id="CurrencySlider36" defaultMessage="+" />
            </a> */}
          </div>
        </div>
      </Fragment>
    )
  }
}
