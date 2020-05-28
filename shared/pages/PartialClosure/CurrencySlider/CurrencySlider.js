import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'

import styles from './CurrencySlider.scss'
import cssModules from 'react-css-modules'

import config from 'app-config'
import ItemsCarousel from 'react-items-carousel'

import { FormattedMessage } from 'react-intl'

import images from './images'


const names = ['btc', 'eth', 'swap']

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
    const { activeItemIndex, children } = this.state
    const { currencies } = this.props
    const curr = Object.values(currencies).map(item => item.name.toLowerCase())

    return (
      <Fragment>
        <div styleName="block">
          <h3 styleName="availableCurrencies">
            <FormattedMessage id="CurrencySlider19" defaultMessage="Already available for exchange" />
          </h3>
          <div styleName="currencyListWrap">
            <ul styleName="currencyList">
              {names.map((item, index) => (
                <li styleName={item !== 'eth' ? 'currencyListItem' : 'currencyListItemEth'} key={index}>
                  <img src={images[item]} alt="" />
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
