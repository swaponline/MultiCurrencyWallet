import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import { constants } from 'helpers'

import styles from './CurrencySlider.scss'
import cssModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'

import images from './images'

//@ts-ignore
const tokens = window.widgetERC20Tokens ? Object.keys(window.widgetERC20Tokens) : ['swap']
const names = ['btc', 'eth', ...tokens]

const isDark = localStorage.getItem(constants.localStorage.isDark)

@connect(
  ({ currencies: { items: currencies } }) => ({
    currencies,
  })
)
@cssModules(styles, { allowMultiple: true })
export default class CurrencySlider extends Component<any, any> {

  state = {
    children: [],
    activeItemIndex: 0,
  }

  getItemImage(name) {
    //@ts-ignore
    if (window.widgetERC20Tokens
      //@ts-ignore
      && window.widgetERC20Tokens[name]
      //@ts-ignore
      && window.widgetERC20Tokens[name].icon
    //@ts-ignore
    ) return window.widgetERC20Tokens[name].icon

    if (images[name]) return images[name]
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
              {names.map((item, index) => {
                const src = this.getItemImage(item)
                if (!src) return null
                return (
                  <li styleName={item !== 'eth' ? 'currencyListItem' : 'currencyListItemEth'} key={index}>
                    <img src={src} alt="" />
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </Fragment>
    )
  }
}
