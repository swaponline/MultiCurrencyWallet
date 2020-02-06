import React, { Component } from 'react'
import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import ShareButton from 'components/controls/ShareButton/ShareButton'

const labels = defineMessages({
  Title: {
    id: 'InfoPay_1',
    defaultMessage: 'Успешно',
  },
  Text: {
    id: 'InfoPay_2',
    defaultMessage: 'были успешно переданы'
  }
})
@injectIntl

export default class InfoPay extends React.Component {
 
  render() {
 
    const {  intl, data: { amount, currency, address, tx } } = this.props
    const name = 'InfoPay'
    const link = `https://www.blockchain.com/ru/btc/tx/${tx}`

    console.log(tx)
    return (
      <Modal name={name} title={intl.formatMessage(labels.Title)} >
        <span >{amount} {currency}</span> <FormattedMessage id="InfoPay_2" defaultMessage="были успешно переданы
" /> {address}!
        <ShareButton link={link} title={amount.toString() + ' ' +currency.toString() + ' '+ intl.formatMessage(labels.Text) + ' ' + address}/>
      </Modal>
    )
  }
}