import React, { Component } from 'react'

import actions from 'redux/actions'
import { connect } from 'redaction'
import { links } from 'helpers'

import CurrencyDirectionChooser from 'components/CurrencyDirectionChooser/CurrencyDirectionChooser'
import PageHeadline from 'components/PageHeadline/PageHeadline'

import Orders from './Orders/Orders'


@connect(({ core: { filter }, currencies: { items: currencies } }) => ({
  filter,
  currencies,
}))
export default class Home extends Component {

  constructor({ initialData, match: { params: { buy, sell } } }) {
    super()

    const { buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      buyCurrency: buy || buyCurrency || 'swap',
      sellCurrency: sell || sellCurrency || 'btc',
    }
  }

  componentWillMount() {
    const { match: { params: { buy, sell } } } = this.props

    if (buy !== this.state.sellCurrency || sell !== this.state.sellCurrency) {
      actions.core.setFilter(`${sell}-${buy}`)
    }
  }

  handleBuyCurrencySelect = ({ value }) => {
    const { sellCurrency, buyCurrency } = this.state

    this.setState({
      buyCurrency: value,
      sellCurrency: value === buyCurrency ? buyCurrency : sellCurrency,
    })
  }

  handleSellCurrencySelect = ({ value }) => {
    const { sellCurrency, buyCurrency } = this.state

    this.setState({
      buyCurrency: value === buyCurrency ? sellCurrency : buyCurrency,
      sellCurrency: value,
    })
  }

  flipCurrency = () => {
    const { buyCurrency, sellCurrency } = this.state

    this.setState({
      buyCurrency: sellCurrency,
      sellCurrency: buyCurrency,
    })
  }

  setFilter = (filter) => {
    actions.core.setFilter(filter)
  }

  handleNext = () => {
    const { history } = this.props
    const { buyCurrency, sellCurrency } = this.state

    this.setFilter(`${buyCurrency}-${sellCurrency}`)
    history.replace((`${links.home}${buyCurrency}-${sellCurrency}`))
  }

  render() {
    const { match: { params: { orderId } }, history: { location: { pathname } }, currencies } = this.props
    const { buyCurrency, sellCurrency } = this.state

    return (
      <section style={{ position: 'relative', width: '100%' }}>
        <PageHeadline>
          {
            pathname === links.exchange ?
              <CurrencyDirectionChooser
                handleSellCurrencySelect={this.handleSellCurrencySelect}
                handleBuyCurrencySelect={this.handleBuyCurrencySelect}
                handleSubmit={this.handleNext}
                buyCurrency={buyCurrency}
                sellCurrency={sellCurrency}
                flipCurrency={this.flipCurrency}
                currencies={currencies}
              />
              :
              <Orders
                handleSellCurrencySelect={this.handleSellCurrencySelect}
                handleBuyCurrencySelect={this.handleBuyCurrencySelect}
                buyCurrency={buyCurrency}
                sellCurrency={sellCurrency}
                flipCurrency={this.flipCurrency}
                orderId={orderId}
              />
          }
        </PageHeadline>
      </section>
    )
  }
}
