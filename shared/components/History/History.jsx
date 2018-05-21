import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import Wallet from './Wallet'
import actions from 'redux/actions'


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
  ethAddress: state.user.ethData.address,
  btcAddress: state.user.btcData.address,
}))
export default class History extends Component {

  componentWillMount() {
    const { ethAddress, btcAddress } = this.props
    actions.user.setTransactions(ethAddress, btcAddress)
  }

  render() {
    const { transactions, fetching } = this.props
    return (
      <tbody>
        { transactions.map((item, index) => (
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
  transactions: PropTypes.array,
  fetching: PropTypes.bool,
}

