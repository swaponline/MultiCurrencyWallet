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


const minAmount = {
  eth: 0.05,
  btc: 0.004,
  eos: 1,
  noxon: 1,
  swap: 1,
  jot: 1,
}


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

    actions[currency.toLowerCase()].send(contractAddress || address, to, Number(amount), decimals)
      .then(() => {
        actions.loader.hide()
        actions[currency.toLowerCase()].getBalance(currency)

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
      linked.amount.check((value) => value > minAmount[data.currency], `Amount must be greater than ${minAmount[data.currency]} `)
      linked.amount.check((value) => value < balance, `Amount must be bigger your balance`)
    }

    return (
      <Modal name={name} title={`Withdraw ${data.currency.toUpperCase()}`}>
        <p style={{ fontSize: '16px' }}>Please notice, that you need to have minimum 0.01 amount <br /> of the ETH on your wallet, to use it for Ethereum miners fee</p>
        <FieldLabel inRow>Address</FieldLabel>
        <Input valueLink={linked.address} focusOnInit pattern="0-9a-zA-Z" placeholder="Enter address" />
        <FieldLabel inRow>Amount</FieldLabel>
        <Input valueLink={linked.amount} pattern="0-9\." placeholder={`Enter amount, you have ${balance}`} />
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
