import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './BTCMultisignRequest.scss'
import { FormattedMessage, injectIntl } from 'react-intl'
import Notification from 'components/notification/Notification/Notification'
import { links }    from 'helpers'
import actions from 'redux/actions'
import { localisedUrl } from 'helpers/locale'


@cssModules(styles)
class BTCMultisignRequest extends Component<any, any> {

  handleClick = () => {
    const { history, data: { txRaw, invoice } } = this.props
    actions.modals.closeAll()
    if (invoice && invoice.id) {
      location.hash = `#${links.multisign}/btc/confirminvoice/${invoice.id}|${txRaw}`
    } else {
      location.hash = `#${links.multisign}/btc/confirm/${txRaw}`
    }
  }

  render() {
    const { name, data: { amount, currency, address } } = this.props

    return (
      <Notification name={name} onClick={this.handleClick}>
        <div>
          <FormattedMessage id="BTCMS_WithdrawRequest" defaultMessage="Запрос на отправку с кошелька BTC-multisign" />
        </div>
        <FormattedMessage 
          id="BTCMS_WithdrawRequestInfo" 
          defaultMessage="Отправка {amount} {currency} на кошелек {address}" 
          values={{
            amount,
            currency,
            address,
          }} />
      </Notification>
    )
  }
}

export default injectIntl(BTCMultisignRequest)
