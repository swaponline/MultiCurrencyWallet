import React from 'react'
import { withRouter } from 'react-router'

import cssModules from 'react-css-modules'
import styles from './styles.scss'

import { Modal } from 'components/modal'
import { defineMessages, injectIntl } from 'react-intl'

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
export default class CreditCardDeposit extends React.Component {
  componentDidMount() {
    const { intl } = this.props

    window.ItezWidget.run({
      target_element: 'widget-container',
      sum: '100',
      CUR: window.DEFAULT_FIAT || "USD",
      id: '004',
      lang: intl.locale
    });
  }

  render() {
    const { intl, match } = this.props

    console.log({ match })
    return (
      <Modal name={name} title={intl.formatMessage(title.Deposit)}>
        <div styleName="pageWrapper">
          <div styleName="instruction">
            <h3>{intl.formatMessage(title.Instructions)}</h3>
            <li>{intl.formatMessage(title.first)}</li>
            <li>{intl.formatMessage(title.second)} {match.params.address}</li>
            <li>{intl.formatMessage(title.third)})</li>
            <li><a href="https://t.me/sashanoxon" target="_blank" rel="noopener noreferrer">{intl.formatMessage(title.forth)}</a></li>
          </div>
          <div id="widget-container" styleName="itezWidget"></div>
        </div>

      </ Modal>
    )
  }
}
