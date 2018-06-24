import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'redaction'
import { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './WithdrawModal.scss'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'


@connect({
  ethData: 'user.ethData',
  btcData: 'user.btcData',
  nimData: 'user.nimData',
})
@cssModules(styles)
export default class WithdrawModal extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    data: PropTypes.object,
  }

  state = {
    isSubmitted: false,
    address: '',
    amount: '',
  }

  handleSubmit = () => {
    const { address: to, amount } = this.state
    const { ethData, btcData, nimData, data: { currency } } = this.props

    if (!to || !amount || amount < 0.01) {
      this.setState({
        isSubmitted: true,
      })
      return
    }

    let action
    let from

    if (currency === 'ETH') {
      action = actions.ethereum
      from = ethData.address
    }
    else if (currency === 'BTC') {
      action = actions.bitcoin
      from = btcData.address
    }
    else if (currency === 'NIM') {
      action = actions.nimiq
      from = nimData.address
    }
    else if (currency === 'NOXON') {
      action = actions.token
    }

    actions.loader.show()

    action.send(from, to, Number(amount))
      .then(() => {
        actions.loader.hide()
        action.getBalance()

        actions.notifications.show(constants.notifications.SuccessWithdraw, {
          amount,
          currency,
          address: to,
        })
      })
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
    const { isSubmitted, address, amount } = this.state
    const { name, data } = this.props

    const linked = Link.all(this, 'address', 'amount')
    const isDisabled = !address || !amount

    if (isSubmitted) {
      linked.amount.check((value) => value >= 0.01, 'Amount must be greater than 0.01')
    }

    return (
      <Modal name={name} title={`Withdraw ${data.currency.toUpperCase()}`}>
        <FieldLabel inRow>Address</FieldLabel>
        <Input valueLink={linked.address} />
        <FieldLabel inRow>Amount</FieldLabel>
        <Input valueLink={linked.amount} pattern="0-9\." />
        {
          !linked.amount.error && (
            <div styleName="note">No less than 0.01</div>
          )
        }
        <Button
          styleName="button"
          brand
          fullWidth
          disabled={isDisabled}
          onClick={this.handleSubmit}
        >
          Transfer
        </Button>
      </Modal>
    )
  }
}
