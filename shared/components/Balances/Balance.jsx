import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'

import Wallet from './Wallet'


@connect(state => ({
  wallets:  [].concat(state.user.ethData, state.user.btcData),
  ethAddress: state.user.ethData.address,
  btcAddress: state.user.btcData.address,
}))
export default class Balance extends Component {

  componentWillMount() {
    const { ethAddress, btcAddress } = this.props
    actions.user.getBalances(ethAddress, btcAddress)
  }

  render() {
    const { wallets } = this.props
    return (
      <tbody>
        {wallets.map((wallet, index) =>
          (<Wallet
            key={index}
            balance={wallet.balance}
            currency={wallet.currency}
            address={wallet.address}
            openModal={() => actions.modals.open('CARD', true, { ...wallet })}
          />)
        )}
      </tbody>
    )
  }
}

Balance.propTypes = {
  wallets: PropTypes.array,
}
