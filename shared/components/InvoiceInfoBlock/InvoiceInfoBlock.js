import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './InvoiceInfoBlock.scss'
import { FormattedMessage } from 'react-intl'


const InvoiceInfoBlock = (props) => {
  const { invoiceData } = props



  return (
    <div styleName='invoiceInfoBlock'>
      <h4>
        <FormattedMessage id='InvoiceInfoBlockTitle' defaultMessage='Оплата инвойса #{id}-{invoiceNumber}' values={invoiceData} />
      </h4>
      {invoiceData.label && 
        <span>{invoiceData.label}</span>
      }
      <hr />
    </div>
  )
}

InvoiceInfoBlock.propTypes = {
  invoiceData: PropTypes.object,
}

export default cssModules(InvoiceInfoBlock, styles, { allowMultiple: true })
