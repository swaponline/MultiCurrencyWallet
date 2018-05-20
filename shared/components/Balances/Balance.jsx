import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'

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
        {fetching ? wallets.map((wallet, index) =>
          (<Wallet
            key={index}
            balance={wallet.balance}
            currency={wallet.currency}
            address={wallet.address}
            openModal={() => actions.modals.open('CARD', true, { ...wallet })}
          />)
        ) : <tr><td>Идет загрузка... </td></tr> }
      </tbody>
    )
  }
}

Balance.propTypes = {
  wallets: PropTypes.array,
  openModal: PropTypes.func,
  fetching: PropTypes.bool,
}
