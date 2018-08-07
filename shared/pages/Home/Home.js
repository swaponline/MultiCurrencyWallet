import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { localStorage, constants, links } from 'helpers'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'

import Orders from './Orders/Orders'


export default class Home extends Component {

  constructor({ initialData, match: { params: { buy, sell } } }) {
    super()

    const { buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      buyCurrency: buy || buyCurrency || 'eth',
      sellCurrency: sell || sellCurrency || 'btc',
      view: 'saveKeys',
    }
  }

  componentWillReceiveProps() {
    this.setState({})
  }

  handleBuyCurrencySelect = ({ value }) => {
    let { sellCurrency, buyCurrency } = this.state

    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    this.handelReplaceHistory(sellCurrency, value)

    this.setState({
      buyCurrency: value,
      sellCurrency,
    })
  }

  handleSellCurrencySelect = ({ value }) => {
    let { sellCurrency, buyCurrency } = this.state

    if (value === buyCurrency) {
      buyCurrency = sellCurrency
    }

    this.handelReplaceHistory(value, buyCurrency)

    this.setState({
      buyCurrency,
      sellCurrency: value,
    })
  }

  handelReplaceHistory = (sellCurrency, buyCurrency) => {
    const { history } = this.props

    this.setFilter(`${sellCurrency}${buyCurrency}`)
    history.replace((`${links.orders}/${buyCurrency}-${sellCurrency}`))
  }

  flipCurrency = () => {
    let { buyCurrency, sellCurrency } = this.state
    const value = sellCurrency

    sellCurrency = buyCurrency
    buyCurrency = value

    this.handelReplaceHistory(sellCurrency, buyCurrency)

    this.setState({
      buyCurrency,
      sellCurrency,
    })
  }

  setFilter = (filter) => {
    actions.core.setFilter(filter)
  }

  handleClickTelegram = () => {
    actions.analytics.dataEvent('orders-click-telegram-group')
    actions.analytics.dataEvent('orders-click-start-swap')
  }

  handleClickMailing = () => {
    actions.analytics.dataEvent('orders-click-start-swap')
    actions.analytics.dataEvent('orders-click-start-swap')
  }

  render() {
    const { buyCurrency, sellCurrency } = this.state

    return (
      <section style={{ position: 'relative' }}>
        <PageHeadline >
          <Fragment>
            <Title>Swap.Online - Decentralized Exchange Based on Atomic Swap Protocol</Title>
            <SubTitle>
              Check out our <a href="https://wiki.swap.online/en.pdf" target="_balnk" rel="noreferrer noopener">project brief</a> and participate in smart airdrop.
            </SubTitle>
          </Fragment>
          <Orders
            handleSellCurrencySelect={this.handleSellCurrencySelect}
            handleBuyCurrencySelect={this.handleBuyCurrencySelect}
            buyCurrency={buyCurrency}
            sellCurrency={sellCurrency}
            flipCurrency={this.flipCurrency}
          />
        </PageHeadline>
      </section>
    )
  }
}
