import React, { Component } from 'react'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Title from 'components/PageHeadline/Title/Title'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Href from 'components/Href/Href'
import SearchSwap from 'components/SearchSwap/SearchSwap'


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

  render() {
    const { buyCurrency, sellCurrency } = this.state
    const filterOrders = `${buyCurrency}${sellCurrency}`

    return (
      <section>
        <PageHeadline>
          <Title>Swap.Online</Title>
          <SubTitle>
            We are working to start swap.online as soon as possible.<br />
            Subscribe to <Href tab="https://t.me/swaponlineint">telegram</Href> and <Href redirect="/">mailing list</Href>
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
