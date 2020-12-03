import React from 'react'
import cssModules from 'react-css-modules'
import styles from './AdminFeeInfoBlock.scss'
import { FormattedMessage } from 'react-intl'

const AdminFeeInfoBlock = (props) => {
  const {
    fee,
    min,
    currency,
  } = props

  return (
    <div styleName="adminFeeInfoBlock">
      <FormattedMessage
        id="AdminFee_Message"
        defaultMessage="Коммисия {fee}% от суммы перевода, но не менее {min} {currency}"
        values={{
          fee,
          min,
          currency,
        }}
      />
    </div>
  )
}

export default cssModules(AdminFeeInfoBlock, styles, { allowMultiple: true })
