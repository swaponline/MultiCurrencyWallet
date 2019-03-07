import React, { Component, Fragment } from 'react'

import styles from './CurrencySlider.scss'
import cssModules from 'react-css-modules'

import usdt from './images/usdt.svg'
import trx from './images/trx.svg'
import btc from './images/btc.svg'
import ltc from './images/ltc.svg'
import dash from './images/dash.svg'
import xrp from './images/xrp.svg'
import fire from './images/fire.svg'


@cssModules(styles)
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
              <li styleName="currencyListItem">
                <img src={usdt} alt="" />
              </li>
              <li styleName="currencyListItem">
                <img src={trx} alt="" />
              </li>
              <li styleName="currencyListItem">
                <img src={btc} alt="" />
              </li>
              <li styleName="currencyListItem">
                <span styleName="fireItem">
                  <img src={fire} alt="" />
                </span>
                <img src={ltc} alt="" />
              </li>
              <li styleName="currencyListItem">
                <img src={dash} alt="" />
              </li>
              <li styleName="currencyListItem">
                <img src={xrp} alt="" />
              </li>
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
