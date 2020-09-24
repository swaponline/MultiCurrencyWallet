import React from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { constants } from 'helpers'

import Link from 'sw-valuelink'

import cssModules from 'react-css-modules'
import styles from './Approve.scss'

import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FieldLabel, Input } from 'components/forms'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'


const title = defineMessages({
  approveTitle: {
    id: 'Approve66',
    defaultMessage: 'Approve token',
  },
})

@injectIntl
@cssModules(styles)
export default class Offer extends React.Component {

  static propTypes = {
    name: PropTypes.string,
  }

  state = {
    amount: 999999,
    isSubmitted: false,
  }

  handleApprove = () => {
    const { amount } = this.state
    const { data: { contractAddress, name } } = this.props
    const message = `Your approve ${amount} tokens on contract address ${contractAddress}`
    const error = `Please try again later`

    if (amount <= 0 || !amount) {
      this.setState({
        isSubmitted: true,
      })
      return
    }

    actions.token.approve(name, amount)
      .then(() => {
        actions.loader.hide()
        actions.notifications.show(constants.notifications.Message, { message })
        actions.modals.close(constants.modals.Approve)
      })
      .catch(() => {
        actions.loader.hide()
        actions.notifications.show(constants.notifications.Message, { error })
        actions.modals.close(constants.modals.Approve)
      })
  }

  render() {
    const { name, intl } = this.props
    const { amount, isSubmitted } = this.state
    const linked = Link.all(this, 'amount')
    const isDisabled = !amount

    if (isSubmitted) {
      linked.amount.check((value) => value <= 0, `Amount must be greater than 1 `)
    }

    return (
      <Modal name={name} title={intl.formatMessage(title.approveTitle)}>
        <div styleName="content">
          <p>
            <FormattedMessage
              id="Approve70"
              defaultMessage="Please set the amount limit that the swap smart contract can deduct from your account. We do not recommend setting any limits." />
          </p>
          <FieldLabel inRow>
            <FormattedMessage id="Approve73" defaultMessage="Amount" />
          </FieldLabel>
          <Input valueLink={linked.amount} type="number" />
          <Button styleName="button" brand fullWidth disabled={isDisabled} onClick={this.handleApprove}>
            <FormattedMessage id="Approve80" defaultMessage="Approve" />
          </Button>
        </div>
      </Modal>
    )
  }
}
