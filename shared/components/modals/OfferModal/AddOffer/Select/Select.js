import React, { Fragment } from 'react'
import styles from './Select.scss'
import cssModules from 'react-css-modules'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import { FormattedMessage } from 'react-intl'
import Switching from 'components/controls/Switching/Switching'
import BigNumber from 'bignumber.js'


const Select = ({ balance, currency, changeBalance, switching, all, estimatedFeeValues, ...props }) => (
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
      <div styleName="cell" onClick={() => changeBalance(BigNumber(balance).div(4))}>
        <FormattedMessage id="Select23" defaultMessage="25%" />
      </div>
      <div styleName="cell" onClick={() => changeBalance(BigNumber(balance).div(4))}><FormattedMessage id="Select25" defaultMessage="50%" /></div>
      <div styleName="cell" onClick={() => changeBalance(BigNumber(balance).div(2))}><FormattedMessage id="Select30" defaultMessage="75%" /></div>
      <div styleName="cell" onClick={() => changeBalance(BigNumber(balance).div(2))}><FormattedMessage id="Select40" defaultMessage="100%" /></div>
    </div>
    <Switching onClick={switching} />
  </Fragment>
)

export default cssModules(Select, styles)
