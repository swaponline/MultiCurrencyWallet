import React, { Component } from 'react'
import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import ShareButton from 'components/controls/ShareButton/ShareButton'

const labels = defineMessages({
  Title: {
    id: 'InfoPay_1',
    defaultMessage: 'Успешно',
  },
})
@injectIntl

export default class InfoPay extends React.Component {
 
  render() {
 
    const {  intl, data: { amount, currency, address } } = this.props
    let name = 'InfoPay'
    
    const link = `https://www.blockchain.com/ru/btc/tx/1f2c5766bfcee8cc85822947ad56a9029cce2a49ca9c789d94834d35b2fd7d6d`;

    return (
      <Modal name={name} title={intl.formatMessage(labels.Title)} >
        <span >{amount} {currency}</span> <FormattedMessage id="InfoPay_2" defaultMessage="были успешно переданы
" /> {address}!
        <ShareButton link={link}/>
      </Modal>
    )
  }
}