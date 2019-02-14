import React, { Fragment } from 'react'
import styles from './Select.scss'
import cssModules from 'react-css-modules'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import { FormattedMessage } from 'react-intl'
import Switching from 'components/controls/Switching/Switching'
import BigNumber from 'bignumber.js'


const Select = ({ balance, currency, changeBalance, switching, ...props }) => (
  <Fragment>
    {
      props.isExchange
        ? ''
        : (
          <FieldLabel inRow >
            <FormattedMessage id="Select10" defaultMessage="Available amount to sell" />
          </FieldLabel>
        )
    }
    <div styleName="groupField">
      <p>{currency.toUpperCase()} { balance ? parseFloat(balance).toFixed(5) : 0.00 }</p>
      <div styleName="cell" onClick={() => changeBalance(BigNumber(balance).div(10))}>
        <FormattedMessage id="Select15" defaultMessage="Sell " />
        1/10
      </div>
      <div styleName="cell" onClick={() => changeBalance(BigNumber(balance).div(4))}><FormattedMessage id="Select26" defaultMessage="1/4" /></div>
      <div styleName="cell" onClick={() => changeBalance(BigNumber(balance).div(2))}><FormattedMessage id="Select27" defaultMessage="1/2" /></div>
      <Switching onClick={switching} />
    </div>
  </Fragment>
)

export default cssModules(Select, styles)
