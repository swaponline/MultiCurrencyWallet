import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import actions from 'redux/actions'

import Modal from 'components/modal/Modal/Modal'

import Footer from './Footer/Footer'
import Address from './Address/Address'
import Amount from './Amount/Amount'


@connect({
  ethData: 'user.ethData',
  btcData: 'user.btcData',
})
export default class WithdrawModal extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  state = {
    address: ' ',
    amount: 0,
  }

  withdraw = (address, amount, currency) => {
    const { ethData, btcData } = this.props
    switch (currency) {
      case 'ETH':
        return actions.ethereum.send(ethData.address, address, amount, ethData.privateKey)
          .then(() => {
            actions.notification.update('Money withdraw ETH', true, {})
          })
      case 'BTC':
        return actions.bitcoin.send(btcData.address, address, amount, btcData.keyPair)
          .then(() => {
            actions.notification.update('Money withdraw BTC', true, {})
          })

      default:
        return console.log('Не задан currency в функции withdraw')
    }
  }

  setAmount = (amount) => {
    this.setState({
      amount,
    })
  }

  setAddress = (address) => {
    this.setState({
      address,
    })
  }

  render() {
    const { address, amount } = this.state
    const { name, data } = this.props

    return (
      <Modal name={name} title={`Withdraw ${data.currency.toUpperCase()}`}>
        <Address
          setAddress={this.setAddress}
          currency={data.currency}
        />
        <Amount
          currency={data.currency}
          balance={data.balance}
          setAmount={this.setAmount}
        />
        <Footer
          withdraw={this.withdraw}
          address={address}
          amount={amount}
          currency={data.currency}
        />
      </Modal>
    )
  }
}
