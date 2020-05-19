import React, { PureComponent } from 'react'

import { withRouter } from 'react-router'
import { defineMessages, injectIntl } from 'react-intl'
import cssModules from 'react-css-modules'

import actions from "redux/actions";
import { constants } from 'helpers'

import { Modal } from 'components/modal'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

import styles from './styles.scss'


const title = defineMessages({
  Deposit: {
    id: 'CreditCardDeposit',
    defaultMessage: 'Credit card deposit',
  },
  Instructions: {
    id: 'DepositInstructions',
    defaultMessage: 'Instructions.',
  },
  first: {
    id: 'CreditCardDepositFirstStep',
    defaultMessage: 'Enter amount in "you pay" input and click "Buy Bitcoin"',
  },
  second: {
    id: 'CreditCardDepositSecondStep',
    defaultMessage: 'When asked, copy-paste this Bitcoin address:',
  },
  third: {
    id: 'CreditCardDepositThirdStep',
    defaultMessage: 'Verify your identity if needed. (payments with less than 300$ value does not need verification)',
  },
  forth: {
    id: 'CreditCardDepositForthStep',
    defaultMessage: 'Contact support if needed.',
  },
})

@injectIntl
@withRouter
@cssModules(styles, { allowMultiple: true })
export default class CreditCardDeposit extends PureComponent {
  state = {
    loading: true
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState(() => ({ loading: false }))
    }, 4000)

  }

  handleClose = () => {
    const { match } = this.props
    actions.modals.open(constants.modals.ReceiveModal, {
      currency: "BTC",
      address: match.params.address
    })
  }

  render() {
    const { intl, match } = this.props
    const { loading } = this.state

    return (
      <Modal name={name} title={intl.formatMessage(title.Deposit)} onClose={this.handleClose}>
        <div styleName="pageWrapper">
          <div styleName="instruction">
            <h3>{intl.formatMessage(title.Instructions)}</h3>
            <li>{intl.formatMessage(title.first)}</li>
            <li>{intl.formatMessage(title.second)} {match.params.address}</li>
            <li>{intl.formatMessage(title.third)})</li>
            <li><a href="https://t.me/sashanoxon" target="_blank" rel="noopener noreferrer">{intl.formatMessage(title.forth)}</a></li>
          </div>
          <div styleName="itezWidget">
            {loading && <div styleName="ghostWrapper">
              <InlineLoader />
            </div>}
            <iframe
              title="credit card deposit"
              width="100%"
              height="500px"
              src="https://itez.swaponline.io/?DEFAULT_FIAT=EUR&locale=en"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>

      </ Modal>
    )
  }
}
