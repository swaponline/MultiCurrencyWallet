import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './InvoiceInfoBlock.scss'
import { FormattedMessage } from 'react-intl'


const InvoiceInfoBlock = (props) => {
  const { invoiceData } = props

  let bip0020link = `bitcoin:${(invoiceData.destination) ? invoiceData.destination : invoiceData.fromAddress}`
  bip0020link = `${bip0020link}?amount=${invoiceData.amount}`
  bip0020link = `${bip0020link}&label=Invoice-${invoiceData.id}-${invoiceData.invoiceNumber}`
  if (invoiceData.label) bip0020link = `${bip0020link}&message=${encodeURI(invoiceData.label)}`

  return (
    <div styleName='invoiceInfoBlock'>
      <h4>
        <FormattedMessage id="InvoiceInfoBlockTitle" defaultMessage="Оплата инвойса #{id}-{invoiceNumber}" values={invoiceData} />
      </h4>
      {invoiceData.label &&
        <span>{invoiceData.label}</span>
      }
      {invoiceData.type === 'BTC' &&
        <a href={bip0020link}>
          <FormattedMessage id="InvoiceInfoBlockOpenDesktopApp" defaultMessage="Оплатить с внешнего кошелька" />
        </a>
      }
      <hr />
    </div>
  )
}

InvoiceInfoBlock.propTypes = {
  invoiceData: PropTypes.object,
}

export default cssModules(InvoiceInfoBlock, styles, { allowMultiple: true })
