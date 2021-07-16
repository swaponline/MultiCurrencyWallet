import React from 'react'
import cssModules from 'react-css-modules'
import styles from './InvoiceInfoBlock.scss'
import { FormattedMessage } from 'react-intl'

type ComponentProps = {
  invoiceData: {
    invoiceNumber: number
    amount: number
    id: number
    destAddress: string
    fromAddress: string
    label: string
    type: string
  }
}

const InvoiceInfoBlock = (props: ComponentProps) => {
  const { invoiceData } = props

  let bip0020link = `bitcoin:${(invoiceData.destAddress) ? invoiceData.destAddress : invoiceData.fromAddress}`

  bip0020link = `${bip0020link}?amount=${invoiceData.amount}`
  bip0020link = `${bip0020link}&label=Invoice-${invoiceData.id}-${invoiceData.invoiceNumber}`

  if (invoiceData.label) {
    bip0020link = `${bip0020link}&message=${encodeURI(invoiceData.label)}`
  }

  return (
    <div styleName="invoiceInfoBlock">
      <h4>
        <FormattedMessage id="InvoiceInfoBlockTitle" defaultMessage="Payment of invoice #{id}-{invoiceNumber}" values={invoiceData} />
      </h4>
      {invoiceData.label &&
        <span>{invoiceData.label}</span>
      }
      {invoiceData.type === 'BTC' &&
        <a href={bip0020link}>
          <FormattedMessage id="InvoiceInfoBlockOpenDesktopApp" defaultMessage="Pay from an external wallet" />
        </a>
      }
      <hr />
    </div>
  )
}

export default cssModules(InvoiceInfoBlock, styles, { allowMultiple: true })
