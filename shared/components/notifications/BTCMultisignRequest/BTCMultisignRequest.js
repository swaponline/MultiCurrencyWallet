import React, { Component } from 'react'

import cssModules from 'react-css-modules'
import styles from './BTCMultisignRequest.scss'
import { injectIntl } from 'react-intl'
import Notification from 'components/notification/Notification/Notification'
import { links }    from 'helpers'
import actions from 'redux/actions'
import { localisedUrl } from 'helpers/locale'


@injectIntl
@cssModules(styles)
export default class BTCMultisignRequest extends Component {

  handleClick = () => {
    const { history, data: { txRaw } } = this.props
    actions.modals.closeAll()
    history.push(localisedUrl(`${links.multisign}/btc/confirm/${txRaw}`))
  }

  render() {
    const { name, data: { amount, currency, address } } = this.props

    return (
      <Notification name={name} onClick={this.handleClick}>
        <div>BTC Multisig withdraw request incomming!</div>
        Transfer <span styleName="value">{amount} {currency}</span> to {address}!
      </Notification>
    )
  }
}
