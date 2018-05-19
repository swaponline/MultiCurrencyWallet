import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'

import Wallet from './Wallet'

@connect({
  transactions: 'history.transactions',
  fetching: 'history.fetching',
})
export default class History extends Component {
  render() {
    const { transactions, fetching } = this.props
    return (
      <tbody>
        {transactions.map((item, index) => (
          <Wallet
            key={index}
            direction={item.direction}
            date={item.date}
            value={Number(item.value)}
            address={item.address}
            type={item.type}
          />))
        }
      </tbody>
    )
  }
}

History.propTypes = {
  transactions: PropTypes.array.isRequired,
  fetching: PropTypes.bool.isRequired,
}

