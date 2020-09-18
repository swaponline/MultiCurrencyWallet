import React from 'react'

import cssModules from 'react-css-modules'
import styles from './AdminFeeInfoBlock.scss'
import { FormattedMessage } from 'react-intl'
import { BigNumber } from 'bignumber.js'


const AdminFeeInfoBlock = ({ fee, min, currency, amount }) => {

  let calcedAmount = false
  if (amount) {
    // fee - from amount - percent
    let feeFromAmount = BigNumber(fee).dividedBy(100).multipliedBy(amount)
    if (BigNumber(min).isGreaterThan(feeFromAmount)) feeFromAmount = BigNumber(min)

    calcedAmount = feeFromAmount.toNumber() // Admin fee in satoshi
  }

  return (
    <div styleName="adminFeeInfoBlock">
      {(calcedAmount) ?
        <FormattedMessage
          id="AdminFee_MessageWithAmount"
          defaultMessage="Service fee: {calcedAmount} {currency}"
          values={{
            fee,
            min,
            currency,
            calcedAmount,
          }}
        />
        :
        <FormattedMessage
          id="AdminFee_Message"
          defaultMessage="Service fee: {fee}% of the transfer amount, but not less than {min} {currency}"
          values={{
            fee,
            min,
            currency,
          }}
        />
      }
    </div>
  )
}

export default cssModules(AdminFeeInfoBlock, styles, { allowMultiple: true })
