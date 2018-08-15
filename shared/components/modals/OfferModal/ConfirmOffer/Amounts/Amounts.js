import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Amounts.scss'

import Row from '../Row/Row'
import Value from '../Value/Value'


const Amounts = ({ buyAmount, sellAmount, buyCurrency, sellCurrency }) => (
  <Row title="Exchange">
    <Value value={Number(sellAmount)} currency={sellCurrency} />
    <div styleName="arrow" />
    <Value value={Number(buyAmount)} currency={buyCurrency} />
  </Row>
)

export default CSSModules(Amounts, styles)

