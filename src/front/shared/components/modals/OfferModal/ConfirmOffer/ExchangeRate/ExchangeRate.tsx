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

@CSSModules(styles)
class ExchangeRate extends PureComponent<any, any> {
  render() {
    const { sellCurrency, buyCurrency, exchangeRate, intl } = this.props
    return (
      <Row title={intl.formatMessage(title.ExchangeRate)}>
        <Value value={1} currency={sellCurrency} />
        {' '}
        <div styleName="equal">
          <FormattedMessage id="ExchangeRate14" defaultMessage="=" />
        </div>
        {' '}
        <Value value={new BigNumber(exchangeRate).toString()} currency={buyCurrency} />
      </Row>
    )
  }
}

export default injectIntl(ExchangeRate)
