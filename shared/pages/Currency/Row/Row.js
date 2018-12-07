import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { links }    from 'helpers'
import actions from 'redux/actions'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Row.scss'

import Coin from 'components/Coin/Coin'
import Flip from 'components/controls/Flip/Flip'
import { FormattedMessage } from 'react-intl'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'


@cssModules(styles)
export default class Row extends Component {

  static propTypes = {
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }

    handleReceive = () => {
      const { currency } = this.props


      actions.modals.open(constants.modals.ReceiveModal, {
        currency,
      })
    }

    handleWithdraw = () => {
      const { currency} = this.props

      actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
      actions.modals.open(constants.modals.Withdraw, {
        currency,
      })
    }

  render() {
    const { from, to } = this.props
console.log("sdfdsfgg", this.props)
    return (
      <tr styleName="exchangeTr">
        <td>
          <span>
            <div styleName="exchangeRow">
              <Coin styleName="coin" name={from} size={40} />
              {from.toUpperCase()}
              <Flip />
              <Coin styleName="coin" name={to} size={40} />
              {to.toUpperCase()}
            </div>
          </span>
        </td>
        <td>
          <CurrencyButton wallet="true" onClick={this.handleReceive} >
            <FormattedMessage id="Row313" defaultMessage="Deposit" />
          </CurrencyButton>
          <CurrencyButton wallet="true" onClick={this.handleWithdraw} >
            <FormattedMessage id="CurrencyWallet100" defaultMessage="Send" />
          </CurrencyButton>
          <Link styleName="button" to={`${links.home}${from.toLowerCase()}-${to.toLowerCase()}`}>
            <FormattedMessage id="Row35" defaultMessage="Exchange " />
          </Link>
        </td>
      </tr>
    )
  }
}
