import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './ExchangeRate.scss'

import Row from '../Row/Row'
import Value from '../Value/Value'


const ExchangeRate = ({ value, buyCurrency, sellCurrency }) => (
  <Row title="Exchange rate">
    <Value value={1} currency={buyCurrency} />
    <div styleName="equal">=</div>
    <Value value={1 / Number(value)} currency={sellCurrency} />
  </Row>
)

export default CSSModules(ExchangeRate, styles)
