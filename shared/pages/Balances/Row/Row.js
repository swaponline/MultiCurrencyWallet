import React, { Component } from 'react'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import WithdrawButton from 'components/controls/WithdrawButton/WithdrawButton'
import ReloadButton from 'components/controls/ReloadButton/ReloadButton'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'


@cssModules(styles)
export default class Row extends Component {

  state = {
    isBalanceFetching: false,
  }

  handleReloadBalance = () => {
    const { isBalanceFetching } = this.state

    if (isBalanceFetching) {
      return null
    }

    let { currency } = this.props
    let action

    currency = currency.toLowerCase()

    if (currency === 'eth') {
      action = actions.ethereum.getBalance
      actions.analytics.dataEvent('balances-update-eth')
    }
    else if (currency === 'btc') {
      action = actions.bitcoin.getBalance
      actions.analytics.dataEvent('balances-update-btc')
    }
    else if (currency === 'noxon') {
      action = actions.token.getBalance
      actions.analytics.dataEvent('balances-update-noxon')
    }

    this.setState({
      isBalanceFetching: true,
    })

    action()
      .then(() => {
        this.setState({
          isBalanceFetching: false,
        })
      }, () => {
        this.setState({
          isBalanceFetching: false,
        })
      })
  }

  render() {
    const { isBalanceFetching } = this.state
    const { currency, balance, address } = this.props

    return (
      <tr>
        <td>
          <Coin name={currency} size={40} />
        </td>
        <td>{currency.toUpperCase()}</td>
        <td style={{ minWidth: '80px' }}>
          {
            isBalanceFetching ? (
              <InlineLoader />
            ) : (
              balance
            )
          }
        </td>
        <td>{address}</td>
        <td>
          <ReloadButton styleName="reloadButton" onClick={this.handleReloadBalance} />
          <WithdrawButton data={{ currency, balance, address }} />
        </td>
      </tr>
    )
  }
}
