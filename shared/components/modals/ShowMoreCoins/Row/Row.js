import React, { Component } from 'react'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import { withRouter } from 'react-router'


@withRouter
@cssModules(styles)
export default class Row extends Component {

  isHidenCoin = () => {
    actions.core.markCoinAsHidden(this.props.currency)
  }

  isVisibleCoin = () => {
    actions.core.markCoinAsVisible(this.props.currency)
  }

  getCurrencyFullTitle = (currencyTitle, currencies) => {
    const match = currencies.find((el) => el.title === currencyTitle)
    return match ? match.fullTitle : currencyTitle
  }

  hidenCoin = (hiden) => (
    <button
      onClick={hiden ? this.isVisibleCoin : this.isHidenCoin}
      styleName="button"
    >
      <i className={hiden ? 'fas fa-plus' : 'fas fa-minus'} />
    </button>
  )

  render() {
    const { isHidden, currency } = this.props

    return (
      <tr>
        <td>
          <Coin name={currency} size={40} />
        </td>
        <td>
          {currency}
        </td>
        <td>
          {this.hidenCoin(isHidden)}
        </td>
      </tr>
    )
  }
}
