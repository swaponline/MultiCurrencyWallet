import React, { Fragment } from 'react'
import styles from './Select.scss'
import cssModules from 'react-css-modules'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'


const Select = ({ balance, currency, changeBalance }) => (
  <Fragment>
    <FieldLabel inRow>Available amount for sell</FieldLabel>
    <div styleName="groupField">
      <p>{currency.toUpperCase()} { balance ? balance.toFixed(3) : 0.00 }</p>
      <div styleName="cell" onClick={() => changeBalance(balance / 10)}>Sell 1/10</div>
      <div styleName="cell" onClick={() => changeBalance(balance / 4)}>1/4</div>
      <div styleName="cell" onClick={() => changeBalance(balance / 2)}>1/2</div>
      <div styleName="cell" onClick={() => changeBalance(balance)}>ALL</div>
    </div>
  </Fragment>
)

export default cssModules(Select, styles)
