import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'

import Wallet from './Wallet'

@connect({
  wallets:  'wallets.wallet',
  fetching: 'wallets.fetching',
})
export default class Balance extends Component {
  render() {
    const { wallets, openModal, fetching } = this.props
    return (
      <tbody>
        { wallets.map((item, index) =>
          (<Wallet
            key={index}
            balance={item.balance}
            currency={item.currency}
            address={item.address}
            openModal={() => openModal('CARD', true, { item })}
          />)
        )}
      </tbody>
    )
  }
}

// Balance.propTypes = {
//   wallets: PropTypes.array.isRequired,
//   openModal: PropTypes.func.isRequired,
//   fetching: PropTypes.bool.isRequired,
// }
