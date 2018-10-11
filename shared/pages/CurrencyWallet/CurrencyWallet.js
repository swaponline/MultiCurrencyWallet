import React, { Component } from 'react'

import { connect } from 'redaction'
import { capitalize } from 'helpers/utils'
import { Link, withRouter } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './CurrencyWallet.scss'

import History from 'pages/History/History'
import Button from 'components/controls/Button/Button'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import KeyActionsPanel from 'components/KeyActionsPanel/KeyActionsPanel'
import links from '../../helpers/links'
import actions from '../../redux/actions'
import constants from '../../helpers/constants'


@connect(({ core, user }) => ({
  user,
  hiddenCoinsList: core.hiddenCoinsList,
}))
@withRouter
@CSSModules(styles)
export default class CurrencyWallet extends Component {

  constructor(props) {
    super(props)

    this.state = {
      name: null,
      address: null,
      balance: null,
    }
  }

  static getDerivedStateFromProps(nextProps) {
    const { user, match: { params: { fullName } } } = nextProps

    const currencyData = Object.values(user)
      .concat(Object.values(user.tokensData))
      .filter(v => v.fullName && v.fullName.toLowerCase() === fullName.toLowerCase())[0]

    const { currency, address, contractAddress, decimals, balance   } = currencyData

    return {
      currency,
      address,
      contractAddress,
      decimals,
      fullName,
      balance,
    }
  }

  handleWithdraw = () => {
    const { currency, address, contractAddress, decimals, balance } = this.state

    actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      currency,
      address,
      contractAddress,
      decimals,
      balance,
    })
  }


  render() {
    const { fullName, address, balance, currency } = this.state

    return (
      <div className="root">
        <PageHeadline subTitle={`Your Online ${fullName} Wallet`} />
        <div styleName="info-panel">
          <h3 >
            Your address: <span>{address}</span>
          </h3>
          <h3 >Your {fullName} balance: {balance}{' '}{currency.toUpperCase()}</h3>
        </div>
        <div>
          <Button brand style={{ marginRight: '15px' }} onClick={this.handleWithdraw} >Send</Button>
          <Link to={`${links.home}${currency.toLowerCase()}`} >
            <Button gray>Exchange</Button>
          </Link>
        </div>
        <History />
        <KeyActionsPanel />
      </div>
    )
  }
}
