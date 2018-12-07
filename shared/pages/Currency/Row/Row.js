import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { links, constants }    from 'helpers'
import actions from 'redux/actions'

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
  state ={
    isBalanceEmpty: false,
  }

  componentWillMount() {
    const { isBalanceEmpty } = this.state
    this.checkBalance()
    this.setState({ isBalanceEmpty })
  }

  handleReceive = () => {
    const { selectCurrency:{ address, currency } } = this.props

    actions.modals.open(constants.modals.ReceiveModal, {
      address,
      currency,
    })
  }

  handleWithdraw = () => {
    const { selectCurrency: {
      currency,
      address,
      contractAddress,
      decimals,
      token,
      balance,
      unconfirmedBalance,
    },
    } = this.props

    actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      currency,
      address,
      contractAddress,
      decimals,
      token,
      balance,
      unconfirmedBalance,
    })
  }

  checkBalance = () => {
    const { selectCurrency:{ balance } } = this.props
    if (balance === 0) {
      this.setState({
        isBalanceEmpty: true,
      })
    }
  }

  render() {
    const { from, to, selectCurrency:{ balance, currency, address } } = this.props
    const { isBalanceEmpty } = this.state
    console.log(isBalanceEmpty, balance)
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
          <CurrencyButton
            wallet="true"
            onClick={this.handleReceive}
            data={`currency${currency}`}
            text={<FormattedMessage id="CurrencyWallet110" defaultMessage="Deposit funds to this address of currency wallet" />} >
            <FormattedMessage id="Row313" defaultMessage="Deposit" />
          </CurrencyButton>
          <CurrencyButton
            wallet="true"
            onClick={this.handleWithdraw}
            data={isBalanceEmpty && `${currency}`}
            text={<FormattedMessage id="CurrencyWallet113" defaultMessage="You can not send this asset, because you have a zero balance." />}>
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
