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
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'


const minAmount = {
  eth: 0.05,
  btc: 0.004,
  eos: 1,
  tlos: 1,
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

  componentWillMount() {
    this.setBalanceOnState(this.props.data.currency)
  }

  setBalanceOnState = async (currency) => {
    const balance = await actions[currency.toLowerCase()].getBalance(currency.toLowerCase())
    this.setState(() => ({ balance }))
  }

  handleSubmit = () => {
    const { address: to, amount } = this.state
    const { data: { currency, contractAddress, address, balance, decimals } } = this.props

    this.setBalanceOnState(currency)

    if (!to || !amount || amount < minAmount[currency.toLowerCase()] || amount > balance) {
      this.setState({
        isSubmitted: true,
      })
      return
    }

    actions[currency.toLowerCase()].send(contractAddress || address, to, Number(amount), decimals)
      .then(() => {
        actions.loader.hide()
        actions[currency.toLowerCase()].getBalance(currency)
        this.setBalanceOnState(currency)

        actions.notifications.show(constants.notifications.SuccessWithdraw, {
          amount,
          currency,
          address: to,
        })
      })
  }

  render() {
    const { isSubmitted, address, amount, balance } = this.state
    const { name, data } = this.props

    const linked = Link.all(this, 'address', 'amount')
    const isDisabled = !address || !amount

    if (isSubmitted) {
      linked.amount.check((value) => value < balance, `You don't have enough balance`)
      linked.amount.check((value) => value > minAmount[data.currency], `Amount must be greater than ${minAmount[data.currency.toLowerCase()]} `)
    }

    return (
      <Modal name={name} title={`Withdraw ${data.currency.toUpperCase()}`}>
        <FormattedMessage
          id="WithdrawModal93"
           value={{br:<br />}}
          defaultMessage="Please notice, that you need to have minimum 0.01 amount {br} of the ETH on your wallet, to use it for Ethereum miners fee">
          {message => <p style={{ fontSize: '16px' }}>{message}</p>}
        </FormattedMessage>
        <FormattedMessage id="WithdrawModal96" defaultMessage="Address">
          {message => <FieldLabel inRow>{message}<Tooltip text="destination address" /></FieldLabel>}
        </FormattedMessage>
        <Input valueLink={linked.address} focusOnInit pattern="0-9a-zA-Z" placeholder="Enter address" />
        <FormattedMessage id="WithdrawModal100" defaultMessage="Amount">
          {message => <FieldLabel inRow>{message}</FieldLabel>}
        </FormattedMessage>
        <Input valueLink={linked.amount} pattern="0-9\." placeholder={`Enter amount, you have ${balance}`} />
        {
          !linked.amount.error && (
            <div styleName="note">
              <FormattedMessage id="WithdrawModal106" defaultMessage="No less than" />
            {minAmount[data.currency.toLowerCase()]}</div>
          )
        }
        <Button styleName="button" brand fullWidth disabled={isDisabled} onClick={this.handleSubmit}>
          <FormattedMessage id="WithdrawModal111" defaultMessage="Transfer" />
          {minAmount[data.currency.toLowerCase()]}
        </Button>
      </Modal>
    )
  }
}
