import React, { Component } from 'react'
import { Modal } from 'components/modal'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import cssModules from 'react-css-modules'
import styles from './InfoPay.scss'
import ShareButton from 'components/controls/ShareButton/ShareButton'
import finishSvg from 'shared/pages/Swap/SwapProgress/images/finish.svg'

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
@cssModules(styles, { allowMultiple: true })

export default class InfoPay extends React.Component {
 
  render() {
 
    const {  intl, data: { amount, currency, address, txRaw } } = this.props
    const name = 'InfoPay'
    
    let link = null;
    switch(currency) {
      case 'BTC':
        link = `https://www.blockchain.com/ru/btc/tx/${txRaw.getId()}`

      break;

      case 'ETH':
        link = `https://etherscan.io/tx/${txRaw.transactionHash}`
      break;
    }

    return (
      <Modal name={name} title={intl.formatMessage(labels.Title)} >
        <div styleName="blockCenter"> 
          <img styleName="finishImg" src={finishSvg} alt="finish"/>
          <span >{amount} {currency}</span>
          <span> <FormattedMessage id="InfoPay_2" defaultMessage="были успешно переданы
  " /> {address}!
          </span>
          <div className="p-3">
             <a href={link} target="_blank">{link}</a>
          </div>
        </div>
        <div styleName="blockCenter">
          <ShareButton link={link} title={amount.toString() + ' ' + currency.toString() + ' ' + intl.formatMessage(labels.Text) + ' ' + address}/>
        </div>
      </Modal>
    )
  }
}