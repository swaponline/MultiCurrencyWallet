import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Approve.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'

import Link from 'sw-valuelink'

import actions from 'redux/actions'
import { constants } from 'helpers'


@cssModules(styles)
export default class Offer extends React.Component {

  static propTypes = {
    name: PropTypes.string,
  }

  state = {
    amount: 9999,
  }

  handleApprove = () => {
    const { amount } = this.state
    const { data: { decimals, contractAddress, name } } = this.props
    const message = `Your approve ${amount} tokens on contract address ${contractAddress}`

    actions.loader.show(true, true)

    actions.token.approve(contractAddress, amount, decimals, name)
      .then(() => {
        actions.loader.hide()
        actions.notifications.show(constants.notifications.Message, { message })
        actions.modals.close(constants.modals.Approve)
      })
  }

  render() {
    const { name } = this.props
    const { amount } = this.state
    const linked = Link.all(this, 'amount')
    const isDisabled = !amount

    return (
      <Modal name={name} title="Approve token">
        <div styleName="content">
          <p>Please set the amount limit that the swap smart contract can deduct from your account. We do not recommend setting any limits.</p>
          <FieldLabel inRow>Amount</FieldLabel>
          <Input valueLink={linked.amount} type="number" />
          <Button
            styleName="button"
            brand
            fullWidth
            disabled={isDisabled}
            onClick={this.handleApprove}
          >
            Approve
          </Button>
        </div>
      </Modal>
    )
  }
}
