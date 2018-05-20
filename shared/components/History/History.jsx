import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'

import Wallet from './Wallet'

const getFilteredHistory = (state, filter) => {
  switch (filter) {
    case 'ALL':
      return state

    case 'SENT':
      return state.filter(h => h.direction === 'in')

    case 'RECEIVED':
      return state.filter(h => h.direction === 'out')

    default:
      return state
  }
}

@connect(state => ({
  transactions:  getFilteredHistory(
    state.history.transactions,
    state.history.filter,
  ),
  fetching: state.history.fetching,
}))
export default class History extends Component {
  render() {
    const { transactions, fetching } = this.props
    return (
      <tbody>
        { fetching ? transactions.map((item, index) => (
          <Wallet
            key={index}
            direction={item.direction}
            date={item.date}
            value={Number(item.value)}
            address={item.address}
            type={item.type}
          />)) : <tr><td>Идет загрузка... </td></tr>
        }
      </tbody>
    )
  }
}

History.propTypes = {
  transactions: PropTypes.array,
  fetching: PropTypes.bool,
}

