import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './AdminFeeInfoBlock.scss'
import { FormattedMessage } from 'react-intl'
import { BigNumber } from 'bignumber.js'


const AdminFeeInfoBlock = (props) => {
  const {
    fee,
    min,
    currency,
    amount,
  } = props

  let calcedAmount = false
  if (amount) {
    // fee - from amount - percent
    let feeFromAmount = BigNumber(fee).dividedBy(100).multipliedBy(amount)
    if (BigNumber(min).isGreaterThan(feeFromAmount)) feeFromAmount = BigNumber(min)

    calcedAmount = feeFromAmount.toNumber() // Admin fee in satoshi
  }

  return (
    <div styleName="adminFeeInfoBlock">
      {(calcedAmount) ? (
        <FormattedMessage
          id="AdminFee_MessageWithAmount"
          defaultMessage="Коммисия {calcedAmount} {currency}"
          values={{
            fee,
            min,
            currency,
            calcedAmount,
          }}
        />
      ) : (
        <FormattedMessage
          id="AdminFee_Message"
          defaultMessage="Коммисия {fee}% от суммы перевода, но не менее {min} {currency}"
          values={{
            fee,
            min,
            currency,
          }}
        />
      )
      }
    </div>
  )
}

export default cssModules(AdminFeeInfoBlock, styles, { allowMultiple: true })
