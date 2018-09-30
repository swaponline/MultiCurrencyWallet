import React, { Component } from 'react'
import { connect } from 'redaction'
import { withRouter } from 'react-router-dom'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Button from 'components/controls/Button/Button'
import { WithdrawButton } from 'components/controls'
import KeyActionsPanel from 'components/KeyActionsPanel/KeyActionsPanel'
import History from 'pages/History/History'

import { capitalize } from 'helpers/utils'

import CSSModules from 'react-css-modules'
import styles from './CurrencyWallet.scss'


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
      user: null,
      hiddenCoinsList: null,
      currencyWalletName: null,
      walletAddress: null,
      balance: null,
    }
  }

  static getDerivedStateFromProps(nextProps) {
    const { user, hiddenCoinsList } = nextProps
    let { currencyWallet: currencyWalletName } = nextProps.match.params
    currencyWalletName = currencyWalletName.toLowerCase()
    const currencyData = Object.values(user)
      .concat(Object.values(user.tokensData))
      .filter(v => v.fullName && v.fullName.toLowerCase() === currencyWalletName)[0]
    const walletAddress = currencyData.address
    const { balance } = currencyData

    return {
      user,
      hiddenCoinsList,
      currencyWalletName,
      walletAddress,
      balance,
    }
  }

  render() {
    const { user, hiddenCoinsList, currencyWalletName, walletAddress, balance } = this.state
    return (
      <div className="root">
        <PageHeadline subTitle={`Your Online ${capitalize(currencyWalletName)} Wallet`} />
        <div styleName="info-panel">
          <h3 styleName="info">
            Your address: <span>{walletAddress}</span>
          </h3>
          <h3 styleName="info">Your balance: {balance}</h3>
        </div>
        <div styleName="actions">
          <Button brand>Send</Button>
          <Button gray>Exchange</Button>
        </div>
        <History />
        <KeyActionsPanel />
      </div>
    )
  }
}
