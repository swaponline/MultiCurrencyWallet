import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'
import Toggle from 'components/controls/Toggle/Toggle'

import Row from './Row/Row'
import actions from 'redux/actions'

import { withRouter } from 'react-router'

@withRouter
@connect(({ core: { hiddenCoinsList }, user: { ethData, btcData, ltcData, tokensData, eosData, nimData, usdtData }, currencies: { items: currencies } }) => ({
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
  items: [ ethData, btcData, eosData, usdtData, ltcData /* eosData  nimData */ ],
  currencies,
  hiddenCoinsList,
}))
export default class Currency extends Component {

  state = {
    isBalanceFetching: false,
  }

  getRows = () => {

    const existsSwaps = [
      'ETH2BTC',
      'BTC2ETH',

      'ETH2LTC',
      'LTC2ETH',

      'ETHTOKEN2BTC',
      'BTC2ETHTOKEN',

      'EOS2BTC',
      'BTC2EOS',

      'USDT2ETHTOKEN',
      'ETHTOKEN2USDT',
    ]

    let { match:{ params: { currency } }, currencies } = this.props

    currencies = currencies.filter(c => c.name.toLowerCase() !== currency)

    currencies = currencies.reduce((previous, current) =>
      {
        if (existsSwaps.indexOf(current.name + '2' + currency.toUpperCase()) != -1) {
          previous.push({ from: current.value, to: currency })
        }
        if (existsSwaps.indexOf(currency.toUpperCase() + '2' + current.name) != -1) {
          previous.push({ from: currency, to: current.value })
        }
        return previous
      }, [])

    return currencies
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
    actions.core.markCoinAsHidden(this.getCoin().currency);

  componentWillMount = () => {
    if (!this.getCoin()) {
      this.props.history.push('/')
      return false
    }
    this.rows = this.getRows()
    this.handleReloadBalance()
  }

  render() {
    const { match: { params: { currency } } } = this.props
    const { isBalanceFetching } = this.state
    const coin = this.getCoin()
    if (!coin) return false

    return (
      <section>
        <PageHeadline>
          <Fragment>
            <Title>{currency}</Title>
            <SubTitle>{currency.toUpperCase()} Trade</SubTitle>
          </Fragment>
          <div> Balance: <span>{String(coin.balance).length > 5 ? coin.balance.toFixed(5) : coin.balance} {coin.currency}</span>
          </div>
          <div>
            <Toggle onChange={this.handleInWalletChange} checked={this.isInWallet()} />Added to Wallet
          </div>
        </PageHeadline>
        <Table
          titles={['Coin', 'Exchange', '']}
          rows={this.rows}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
      </section>
    )
  }
}
