import React, { PureComponent } from 'react'

import CSSModules from 'react-css-modules'
import styles from './ExchangeRate.scss'

import Row from '../Row/Row'
import Value from '../Value/Value'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
import BigNumber from 'bignumber.js'


const title = defineMessages({
  ExchangeRate: {
    id: 'ExchangeRate12',
    defaultMessage: `Exchange Rate`,
  },
})

@injectIntl
@CSSModules(styles)
export default class ExchangeRate extends PureComponent {
  render() {
    const { value, buyCurrency, sellCurrency, intl } = this.props
    return (
      <Row title={intl.formatMessage(title.ExchangeRate)}>
        <Value value={BigNumber(1).div(value).toString()} currency={sellCurrency} />
        {' '}
        <div styleName="equal">
          <FormattedMessage id="ExchangeRate14" defaultMessage="=" />
        </div>
        {' '}
        <Value value={1} currency={buyCurrency} />
      </Row>
    )
  }
}
