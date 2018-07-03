import React, { Component } from 'react'
import { connect } from 'redaction'
import actions from 'redux/actions'

import SwapApp from 'swap.app'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Table from 'components/Table/Table'
import Filter from 'components/Filter/Filter'

import Row from './Row/Row'
import SwapsHistory from './SwapsHistory/SwapsHistory'


const filterHistory = (items, filter) => {
  if (filter === 'SENT') {
    return items.filter(({ direction }) => direction === 'out')
  }

  if (filter === 'RECEIVED') {
    return items.filter(({ direction }) => direction === 'in')
  }

  return items
}

@connect(({ history: { transactions, filter } }) => ({
  items: filterHistory(transactions, filter),
}))
export default class History extends Component {

  state = {
    orders: SwapApp.services.orders.items,
  }

  componentDidMount() {
    actions.analytics.dataEvent('open-page-history')
    actions.user.setTransactions()
  }

  componentWillMount() {
    SwapApp.services.orders
      .on('new orders', this.updateOrders)
      .on('new order', this.updateOrders)
      .on('order update', this.updateOrders)
      .on('remove order', this.updateOrders)
      .on('new order request', this.updateOrders)
  }

  componentWillUnmount() {
    SwapApp.services.orders
      .off('new orders', this.updateOrders)
      .off('new order', this.updateOrders)
      .off('order update', this.updateOrders)
      .off('remove order', this.updateOrders)
      .off('new order request', this.updateOrders)
  }

  updateOrders = () => {
    this.setState({
      orders: SwapApp.services.orders.items,
    })

    const { orders } = this.state

    if (orders.length !== 0) {
      actions.feed.getFeedDataFromOrder(orders)
    }
  }

  render() {
    const { items } = this.props
    const { orders } = this.state
    const titles = [ 'Coin', 'Status', 'Amount' ]
    const historyOrders = orders.filter(order => {
      const orderId = order.id.split('-')[0]
      return orderId === order.owner.peer
    })

    return (
      <section>
        <PageHeadline subTitle="History" />
        <SwapsHistory orders={historyOrders} />
        <h3 style={{ marginTop: '50px' }}>All transactions</h3>
        <Filter />
        <Table
          titles={titles}
          rows={items}
          rowRender={(row, index) => (
            <Row key={index} {...row} />
          )}
        />
      </section>
    )
  }
}
