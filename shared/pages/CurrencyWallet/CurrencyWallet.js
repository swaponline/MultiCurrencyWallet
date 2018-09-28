import React, { Component } from 'react'
import { connect } from 'redaction'
import { withRouter } from 'react-router-dom'
import CSSModules from 'react-css-modules'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import Button from 'components/controls/Button/Button'
import { WithdrawButton } from 'components/controls'
import History from 'pages/History/History'
import styles from './CurrencyWallet.scss'
import { mapFullCurrencyNameToAbbreviation, capitalize } from 'helpers/utils'


const mapStateToProps = ({ core, user }) => ({
  user,
  hiddenCoinsList: core.hiddenCoinsList,
})
@connect(mapStateToProps)
@withRouter
@CSSModules(styles)
export default class CurrencyWallet extends Component {
  render() {
    const { user, hiddenCoinsList } = this.props
    const { currencyWallet: currencyWalletName } = this.props.match.params
    const currencyAbbreviation = mapFullCurrencyNameToAbbreviation(currencyWalletName)
    const walletAddress = this.props.user[`${currencyAbbreviation}Data`].address
    const { balance } = this.props.user[`${currencyAbbreviation}Data`]

    return (
      <div>
        <PageHeadline subTitle={`Your Online ${capitalize(currencyWalletName)} Wallet`} />
        <div styleName="info-panel">
          <h3 styleName="info">Your address: {`${walletAddress}`}</h3>
          <h3 styleName="info">Your balance: {`${balance}`}</h3>
        </div>
        <div styleName="actions">
          <Button brand>Send</Button>
          <Button gray>Exchange</Button>
        </div>
        <History />
        <div>
          { process.env.TESTNET && <WithdrawButton onClick={this.handleClear} >Exit</WithdrawButton> }
          <WithdrawButton onClick={this.handleDownload}>Download keys</WithdrawButton>
          <WithdrawButton onClick={this.handleImportKeys}>Import keys</WithdrawButton>
          {
            hiddenCoinsList.length !== 0 &&
            <WithdrawButton onClick={this.handleShowMore}>
              Show more coins ({hiddenCoinsList.length})
            </WithdrawButton>
          }
        </div>
      </div>
    )
  }
}
