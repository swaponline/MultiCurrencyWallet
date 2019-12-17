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
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
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
      <div styleName="modal-overlay">
      <div styleName="modal">
        <div styleName="header">
          <p styleName="title">{context}</p>
            <CloseIcon styleName="closeButton" onClick={this.handleClose} data-testid="modalCloseIcon" />
        </div>
        <div styleName="content">
          <p styleName="text">
            <FormattedMessage id="ReceiveModal200" defaultMessage={`Please choose a currency, which you want to ${context.toLowerCase()}`}  />
          </p>
          <div styleName="currenciesWrapper">
             {currencies.map(item => {
               let iconName = item.currency.toLowerCase()
               let itemTitle = item.currency
               let itemFullTitle = item.fullName

               switch (item.currency) {
                 case 'BTC (Multisig)':
                  iconName = 'btc'
                  itemTitle = 'BTC (MTS)'
                  itemFullTitle = 'BTC (MTS)'
                  break;
                 case 'BTC (SMS-Protected)':
                  iconName = 'btc'
                  itemTitle = 'BTC (SMS)'
                  itemFullTitle = 'BTC (SMS)'
                  break;
               }

               return (
                 <div styleName="card" key={item} onClick={() => this.handleClickCurrency(item)}>
                   <div styleName={`circle ${iconName}`}>
                    <img
                      src={icons[iconName]}
                      alt={`${name} icon`}
                      role="image"
                    />
                   </div>
                   <b>{itemTitle}</b>
                   <span>{itemFullTitle}</span>
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

