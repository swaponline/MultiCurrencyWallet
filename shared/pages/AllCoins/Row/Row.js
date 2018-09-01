import React, { Component } from 'react'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Row.scss'


import Coin from 'components/Coin/Coin'
import WithdrawButton from 'components/controls/WithdrawButton/WithdrawButton'
import { withRouter } from 'react-router'

@withRouter
@cssModules(styles)
export default class Row extends Component {

  handleMarkCoinAsHidden = () => {
    actions.core.markCoinAsHidden(this.props.currency)
  }
  handleMarkCoinAsVisible = () => {
    actions.core.markCoinAsVisible(this.props.currency)
  }

  getCurrencyFullTitle = (currencyTitle, currencies) => {
    const match = currencies.find((el) => el.title === currencyTitle)
    return match ? match.fullTitle : currencyTitle
  }

  render() {
    const { isHidden, currency } = this.props

    return (
      <tr>
        <td>
          <Coin name={currency} size={40} />
        </td>
        <td>{currency}</td>

        <td>
          <div>
            {
              isHidden && (
                <WithdrawButton
                  onClick={this.handleMarkCoinAsVisible}
                  styleName="marginRight"
                >
                  <i className="fas fa-arrow-alt-circle-down" />
                  <span>Show in wallet</span>
                </WithdrawButton>
              )
            }
            {
              !isHidden && (
                <WithdrawButton
                  onClick={this.handleMarkCoinAsHidden}
                  styleName="marginRight"
                >
                  <i className="fas fa-arrow-alt-circle-down" />
                  <span>Hide from wallet</span>
                </WithdrawButton>
              )
            }
          </div>
        </td>
      </tr>
    )
  }
}
