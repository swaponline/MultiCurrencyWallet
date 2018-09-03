import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import config from 'app-config'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Table from 'components/tables/Table/Table'
import Toggle from 'components/controls/Toggle/Toggle'

import Row from './Row/Row'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import actions from 'redux/actions'


@connect(({ core: { hiddenCoinsList }, user: { ethData, btcData, tokensData, eosData, nimData, usdtData }, currencies: { items: currencies } }) => ({
  tokens: Object.keys(tokensData).map(k => (tokensData[k])),
  items: [ ethData, btcData, eosData, usdtData /* eosData  nimData */ ],
  currencies,
  hiddenCoinsList
}))
export default class Currency extends Component {

  state = {
    isBalanceFetching: false
  }

  getRows = () => {

    let { match:{ params: { currency } }, currencies } = this.props

    if (currency === 'btc') {
      currencies = currencies.filter(c => c.value !== currency)
    } else {
      currencies = currencies.filter(c => c.value === 'btc')
    }

    currencies = currencies.reduce((previous, current) =>
      previous.concat({ from: currency, to: current.value }, { from: current.value, to: currency }),
    [])

    return currencies
  }

  getCurrencyName = () => this.props.match.params.currency.toLowerCase();
  getCoin = () => this.props.items.find(coin=>coin.fullName.toLowerCase() === this.getCurrencyName());

  handleReloadBalance = () => {
    const { isBalanceFetching } = this.state
    const currency = this.getCoin().currency.toLowerCase()

    if (isBalanceFetching) {
      return null
    }

    this.setState({
      isBalanceFetching: true,
    })

    actions[currency].getBalance(currency)
      .then(() => {
        this.setState({
          isBalanceFetching: false,
        })
      }, () => {
        this.setState({
          isBalanceFetching: false,
        })
      })
  }

  isInWallet = () => !this.props.hiddenCoinsList.includes(this.getCoin().currency)

  handleInWalletChange = (val) => val ? actions.core.markCoinAsVisible(this.getCoin().currency) :
    actions.core.markCoinAsHidden(this.getCoin().currency);

  componentWillMount = () => {
    this.rows = this.getRows()
    this.handleReloadBalance()
  }

  render() {
    const { match: { params: { currency } } } = this.props
    const { isBalanceFetching } = this.state
    const coin = this.getCoin()
    return (
      <section>
        <PageHeadline>
          <Fragment>
            <Title>{config.currency[currency.toLowerCase()] ? config.currency[currency.toLowerCase()].title : this.getCurrencyName()}</Title>
            <SubTitle>{currency.toUpperCase()} Trade</SubTitle>
            <p>{config.currency[currency.toLowerCase()] ? config.currency[currency.toLowerCase()].description : ''}</p>
          </Fragment>
            <div> Balance: {
              !coin.isBalanceFetched || isBalanceFetching ? (
                <InlineLoader />
              ) : (
                <Fragment>
                  <span>{String(coin.balance).length > 5 ? coin.balance.toFixed(5) : coin.balance} {coin.currency}</span>
                </Fragment>
              )
            } </div>
           <div>
            <Toggle onChange={this.handleInWalletChange} checked={this.isInWallet()}></Toggle>Added to Wallet {this.isInWallet()}

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
