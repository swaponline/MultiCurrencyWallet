import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import { constants } from 'helpers'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'
import Toggle from 'components/controls/Toggle/Toggle'

import Row from './Row/Row'
import actions from 'redux/actions'

import { withRouter } from 'react-router'
import { FormattedMessage } from 'react-intl'


@withRouter
@connect(({ core: { hiddenCoinsList }, user: { ethData, btcData, ltcData, tokensData, eosData, nimData, usdtData } }) => ({
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
  items: [ ethData, btcData, eosData, usdtData, ltcData /* nimData */ ],
  hiddenCoinsList,
}))
export default class Currency extends Component {

  state = {
    isBalanceFetching: false,
  }

  getRows = () => {
    let { match:{ params: { currency } } } = this.props
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

  render() {
    const { match: { params: { currency } } } = this.props
    const { balance } = this.getCoin()

    return (
      <section>
        <PageHeadline>
          <Fragment>
            <Title>{currency}</Title>
            <SubTitle>{currency.toUpperCase()} Trade</SubTitle>
          </Fragment>
          <div>
            <FormattedMessage id="Currency101" defaultMessage="Balance:" />
          <span>{(String(balance).length > 5 ? balance.toFixed(5) : balance) || 0} {currency}</span></div>
          <Toggle onChange={this.handleInWalletChange} checked={this.isInWallet()} />Added to Wallet
        </PageHeadline>
        <Table
          titles={['Coin', 'Exchange', '']}
          rows={this.getRows()}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
      </section>
    )
  }
}
