import React, { Fragment } from 'react'
import styles from './Select.scss'
import cssModules from 'react-css-modules'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import { FormattedMessage } from 'react-intl'


const Select = ({ balance, currency, changeBalance }) => (
  <Fragment>
    <FormattedMessage id="Select10" defaultMessage="Available amount for sell">
      {message => <FieldLabel inRow >{message}</FieldLabel>}
    </FormattedMessage>
    <div styleName="groupField">
      <p>{currency.toUpperCase()} { balance ? parseFloat(balance).toFixed(3) : 0.00 }</p>
      <div styleName="cell" onClick={() => changeBalance(balance / 10)}>
        <FormattedMessage id="Select15" defaultMessage="Sell 1/10" />
      </div>
      <div styleName="cell" onClick={() => changeBalance(balance / 4)}>
        <FormattedMessage id="Select18" defaultMessage="1/4" />
      </div>
      <div styleName="cell" onClick={() => changeBalance(balance / 2)}>
        <FormattedMessage id="Select21" defaultMessage="1/2" />
      </div>
      <div styleName="cell" onClick={() => changeBalance(balance)}>
        <FormattedMessage id="Select24" defaultMessage="ALL" />
      </div>
    </div>
  </Fragment>
)

export default cssModules(Select, styles)
