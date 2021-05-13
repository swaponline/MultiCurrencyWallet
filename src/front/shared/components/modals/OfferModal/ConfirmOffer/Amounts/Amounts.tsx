import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Amounts.scss'

import Row from '../Row/Row'
import Value from '../Value/Value'
import { FormattedMessage } from 'react-intl'

const title = (
  <FormattedMessage id="amount" defaultMessage="Exchange" />
)

const Amounts = ({ buyAmount, sellAmount, buyCurrency, sellCurrency }) => (
  <Row title={title}>
    <Value value={sellAmount} currency={sellCurrency} />
    <span styleName="arrow">&rarr;</span>
    <Value value={buyAmount} currency={buyCurrency} />
  </Row>
)

export default CSSModules(Amounts, styles)
