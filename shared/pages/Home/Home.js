import React, { Component } from 'react'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Title from 'components/PageHeadline/Title/Title'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Href from 'components/Href/Href'
import SearchSwap from 'components/SearchSwap/SearchSwap'
import actions from 'redux/actions'

import Orders from './Orders/Orders'


export default class Home extends Component {

  constructor({ initialData }) {
    super()

    const { buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      buyCurrency: buyCurrency || 'eth',
      sellCurrency: sellCurrency || 'btc',
    }
  }

  handleSellCurrencySelect = ({ value }) => {
    let { buyCurrency, sellCurrency } = this.state

    if (value === sellCurrency) {
      sellCurrency = buyCurrency
    }

    buyCurrency = value

    this.setState({
      buyCurrency,
      sellCurrency,
    })
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
    const filterOrders = `${buyCurrency}${sellCurrency}`

    return (
      <section>
        <PageHeadline>
          <Title>Swap.Online</Title>
          <SubTitle>
            We are working to start swap.online as soon as possible.<br />
            Subscribe to <a href="https://t.me/swaponlineint" onClick={this.handleClickTelegram} target="_blank">telegram</a> and <a href="/" target="_blank"  onClick={this.handleClickMailing}>mailing list</a>
          </SubTitle>
        </PageHeadline>
        <SearchSwap
          updateFilter={this.handleSellCurrencySelect}
          buyCurrency={buyCurrency}
          sellCurrency={sellCurrency}
        />
        <Orders filter={filterOrders} />
      </section>
    )
  }
}
