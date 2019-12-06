import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

import cssModules from 'react-css-modules'

import styles from './CurrencyAction.scss'
import { links, constants } from 'helpers'
import Coin from 'components/Coin/Coin'

import QR from 'components/QR/QR'
import { Modal } from 'components/modal'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { ConsoleView } from 'react-device-detect'
import icons from './images'


const title = defineMessages({
  CurrencyAction: {
    id: 'CurrencyAction',
    defaultMessage: 'CurrencyAction',
  },
})

@injectIntl
@cssModules(styles, { allowMultiple: true })
export default class CurrencyAction extends React.Component {

  constructor(props) {
    super(props)
  }

  handleClose = () => {
    const { name, data, onClose } = this.props

    if (typeof onClose === 'function') {
      onClose()
    }

    if (typeof data.onClose === 'function') {
      data.onClose()
    }

    actions.modals.close(name)
  }

  handleClickCurrency = (item) => {

    const { data: { context } } = this.props;

    const { currency, address } = item;

    if (context === 'Deposit') {
      actions.modals.open(constants.modals.ReceiveModal, {
        currency,
        address
      })
    }  else {
        const { Withdraw, WithdrawMultisigSMS, WithdrawMultisigUser } = constants.modals;
    
        let withdrawModalType = Withdraw;
        if (item.currency === 'BTC (SMS-Protected)') withdrawModalType = WithdrawMultisigSMS;
        if (item.currency === 'BTC (Multisig)') withdrawModalType = WithdrawMultisigUser;
    
        actions.modals.open(withdrawModalType, item)
    }
  }

  render() {
    const { props: { data: { currencies, context } } } = this

    return (
      <div styleName="modal-overlay" onClick={this.handleClose}>
      <div styleName="modal">
        <div styleName="header">
          <p styleName="title">{context}</p>
        </div>
        <div styleName="content">
          <p styleName="text">
            <FormattedMessage id="ReceiveModal50" defaultMessage={`Please choose a currency, which you want to ${context.toLowerCase()}`}  />
          </p>
          <div styleName="currenciesWrapper">
             {currencies.map(item => {
               return (
                 <div styleName="card" key={item} onClick={() => this.handleClickCurrency(item)}>
                   <div styleName={`circle ${[item.currency === 'BTC (Multisig)' ? 'btc' : item.currency.toLowerCase()]}`}> 
                    <img
                      src={icons[item.currency === 'BTC (Multisig)' ? 'btc' : item.currency.toLowerCase()]}
                      alt={`${name} icon`}
                      role="image"
                    />
                   </div>
                   <b>{item.currency === 'BTC (Multisig)' ? 'BTC (MTS)' : item.currency}</b>
                   <span>{item.fullName === 'Bitcoin (Multisig)' ? 'BTC (MTS)' : item.fullName}</span>
                 </div>
               )
             })}
           </div>
        </div>
      </div>
    </div>
    )
  }
}

