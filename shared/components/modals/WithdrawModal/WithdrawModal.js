import React from 'react'
import PropTypes from 'prop-types'
import { constants } from 'helpers'
import actions from 'redux/actions'
import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './WithdrawModal.scss'

import Modal from 'components/modal/Modal/Modal'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'


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
    const { data: { currency, contractAddress, address, decimals, balance } } = this.props

    if (!to || !amount || amount < 0.01 || amount > balance) {
      this.setState({
        isSubmitted: true,
      })
      return
    }

    let action

    if (currency === 'ETH') {
      action = actions.ethereum
    }
    else if (currency === 'BTC') {
      action = actions.bitcoin
    }
    else if (currency === 'NIM') {
      action = actions.nimiq
    }
    else if (currency === 'EOS') {
      action = actions.eos
    }
    else {
      action = actions.token
    }

    actions.loader.show(true, true)

    action.send(contractAddress || address, to, Number(amount), decimals)
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

  render() {
    const { isSubmitted, address, amount } = this.state
    const { name, data } = this.props
    const { balance } = data

    const linked = Link.all(this, 'address', 'amount')
    const isDisabled = !address || !amount

    if (isSubmitted) {
      linked.amount.check((value) => value >= 0.01, `Amount must be greater than 0.01 `)
      linked.amount.check((value) => value < balance, `Amount must be smaller your balance`)
    }

    return (
      <Modal name={name} title={`Withdraw ${data.currency.toUpperCase()}`}>
        <p style={{ fontSize: '16px' }}>Please notice, that you need to have minimum 0.01 amount <br /> of the ETH on your wallet, to use it for Ethereum miners fee</p>
        <FieldLabel inRow>Address</FieldLabel>
        <Input valueLink={linked.address} pattern="0-9a-zA-Z" />
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
