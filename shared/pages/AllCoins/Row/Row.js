import React, { Component, Fragment } from 'react'
import actions from 'redux/actions'
import { constants } from 'helpers'
import { isMobile } from 'react-device-detect'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import CopyToClipboard from 'react-copy-to-clipboard'

import Coin from 'components/Coin/Coin'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import WithdrawButton from 'components/controls/WithdrawButton/WithdrawButton'

import { withRouter } from 'react-router'
import { connect } from 'redaction'

@withRouter
@cssModules(styles)
export default class Row extends Component {

  handleMarkCoinAsHidden = () => {
    actions.core.markCoinAsHidden(this.props.currency);
  }
  handleMarkCoinAsVisible = () => {
    actions.core.markCoinAsVisible(this.props.currency);
  }

  getCurrencyFullTitle = (currencyTitle, currencies) => {
    const match = currencies.find((el) => el.title === currencyTitle)
    return match ? match.fullTitle : currencyTitle
  }

  render() {
    const { isHidden, currency, currencies } = this.props

    const currencyFullTitle = this.getCurrencyFullTitle(currency, currencies)

    return (
      <tr>
        <td>
          <Coin name={currency} size={40} />
        </td>
        <td>{currency}</td>

        <td>
          <div>
            {
              isHidden && <WithdrawButton onClick={this.handleMarkCoinAsVisible} styleName="marginRight">
              <i className="fas fa-arrow-alt-circle-down" />
              <span>Show in wallet</span>
            </WithdrawButton>
            }
            {
              !isHidden && <WithdrawButton onClick={this.handleMarkCoinAsHidden} styleName="marginRight">
              <i className="fas fa-arrow-alt-circle-down" />
              <span>Hide from wallet</span>
            </WithdrawButton>
            }
          </div>
        </td>
      </tr>
    )
  }
}
