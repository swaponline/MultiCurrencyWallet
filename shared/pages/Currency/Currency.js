import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import { constants } from 'helpers'
import { isMobile } from 'react-device-detect'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'
import Toggle from 'components/controls/Toggle/Toggle'

import CSSModules from 'react-css-modules'
import styles from './Currency.scss'

import Row from './Row/Row'
import actions from 'redux/actions'

import { withRouter } from 'react-router'
import { FormattedMessage } from 'react-intl'
import CurrencyButton from 'components/controls/CurrencyButton/CurrencyButton'


@withRouter
@connect(({ core: { hiddenCoinsList }, user: { ethData, btcData, ltcData, tokensData, eosData, nimData, usdtData } }) => ({
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
  items: [ ethData, btcData, eosData, usdtData, ltcData /* nimData */ ],
  hiddenCoinsList,
}))
@CSSModules(styles, { allowMultiple: true })
export default class Currency extends Component {

  state = {
    isBalanceFetching: false,
    isBalanceEmpty: false,
  }

  getRows = () => {
    let { match:{ params: { currency, address } }, items } = this.props
    currency = currency.toLowerCase()

    return constants.tradeTicker
      .filter(ticker => {
        ticker = ticker.split('-')
        return currency === ticker[0].toLowerCase()
          ? ticker[0].toLowerCase() === currency
          : ticker[1].toLowerCase() === currency
      })
      .map(pair => {
        pair = pair.split('-')
        return {
          from: pair[0],
          to: pair[1],
        }
      })
  }

  getCurrencyName = () => this.props.match.params.currency.toLowerCase()
  getCoin = () => [...this.props.items, ...this.props.tokens].find(coin => coin.currency.toLowerCase() === this.getCurrencyName())

  handleReloadBalance = () => {
    const { isBalanceFetching } = this.state
    const coin = this.getCoin()
    const currency = coin.currency.toLowerCase()
    const token = !!coin.token
    const action = token ? 'token' : currency

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    })

    actions[action]
      .getBalance(currency)
      .finally(() => this.setState({
        isBalanceFetching: false,
      }))
  }

  isInWallet = () => !this.props.hiddenCoinsList.includes(this.getCoin().currency)

  handleInWalletChange = (val) => val ? actions.core.markCoinAsVisible(this.getCoin().currency) :
    actions.core.markCoinAsHidden(this.getCoin().currency)

  componentWillMount = () => {
    if (!this.getCoin()) {
      this.props.history.push('/')
      return false
    }

    this.handleReloadBalance()
  }

  handleReceive = () => {
    let { match:{ params: { currency } }, items } = this.props
    const itemCurrency = items.filter(item => item.currency.toLowerCase() === currency)[0]
    const address = itemCurrency.address

    currency = currency.toUpperCase()

    actions.modals.open(constants.modals.ReceiveModal, {
      currency,
      address,
  })
}

  handleWithdraw = () => {
    let { match:{ params: { currency } }, items } = this.props
    const itemCurrency = items.filter(item => item.currency.toLowerCase() === currency)[0]
    
    actions.analytics.dataEvent(`balances-withdraw-${currency.toLowerCase()}`)
    actions.modals.open(constants.modals.Withdraw, {
      ...itemCurrency,
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
    const { match: { params: { currency } } } = this.props
    const { isBalanceEmpty } = this.state
    const { balance } = this.getCoin()
    return (
      <section styleName={isMobile ? 'currencyMobileSection' : 'currencyMediaSection'}>
        <PageHeadline>
          <Fragment>
            <SubTitle>{currency.toUpperCase()} Trade</SubTitle>
          </Fragment>
          <div styleName="currencyBalance">
            <FormattedMessage id="Currency101" defaultMessage="Balance: " />
            <span styleName="currencyBalanceValue">{(String(balance).length > 5 ? balance.toFixed(5) : balance) || 0} {currency}</span>
          </div>
          <div style={{ marginTop: '20px', height: '20px' }}>
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
              text={<FormattedMessage id="CurrencyWallet113" defaultMessage="You can not send this asset, because you have a zero balance." />}>
              <FormattedMessage id="CurrencyWallet100" defaultMessage="Send" />
            </CurrencyButton>
          </div>
        </PageHeadline>
        <Table
          titles={['', '']}
          rows={this.getRows()}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
      </section>
    )
  }
}
