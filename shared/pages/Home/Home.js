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
    }
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

    this.setFilter(`${buyCurrency}${sellCurrency}`)
    history.replace((`${links.exchange}/${buyCurrency}-${sellCurrency}`))
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
    const { match: { params: { orderId } } } = this.props
    const { buyCurrency, sellCurrency } = this.state

    return (
      <section style={{ position: 'relative' }}>
        <PageHeadline >
          <Fragment>
            <Title>{buyCurrency}/{sellCurrency} exchange with 0% comission</Title>
            <SubTitle>Choose the direction of exchange</SubTitle>
          </Fragment>
          <Orders
            handleSellCurrencySelect={this.handleSellCurrencySelect}
            handleBuyCurrencySelect={this.handleBuyCurrencySelect}
            buyCurrency={buyCurrency}
            sellCurrency={sellCurrency}
            flipCurrency={this.flipCurrency}
            orderId={orderId}
          />
        </PageHeadline>
      </section>
    )
  }
}
