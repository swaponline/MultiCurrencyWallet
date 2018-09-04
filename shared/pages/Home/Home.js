import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { connect } from 'redaction'
import { links } from 'helpers'

import Title from 'components/PageHeadline/Title/Title'
import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'

import Orders from './Orders/Orders'


@connect(({ core: { filter } }) => ({
  filter,
}))
export default class Home extends Component {

  constructor({ initialData, match: { params: { buy, sell } } }) {
    super()

    const { buyCurrency, sellCurrency } = initialData || {}

    this.state = {
      buyCurrency: buy || buyCurrency,
      sellCurrency: sell || sellCurrency,
    }
  }

  componentWillMount() {
    let { filter, match: { params: { buy, sell } } } = this.props

    if (!buy && !sell) {
      filter = filter.split('-')
      this.handelReplaceHistory(filter[1], filter[0])

      this.setState(() => ({
        buyCurrency: filter[0],
        sellCurrency: filter[1],
      }))
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
    let { history } = this.props

    this.setFilter(`${buyCurrency}-${sellCurrency}`)
    history.replace((`${links.home}${buyCurrency}-${sellCurrency}`))
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

  render() {
    const { match: { params: { orderId } } } = this.props
    const { buyCurrency, sellCurrency } = this.state

    return (
      <section style={{ position: 'relative', width: '100%' }}>
        <PageHeadline >
          <Fragment>
            <Title>{buyCurrency} &#8594; {sellCurrency} no limit exchange with 0 fee</Title>
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
