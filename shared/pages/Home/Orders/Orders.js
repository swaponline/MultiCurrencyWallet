import React, { Component } from 'react'
import { swapApp } from 'instances/newSwap'
import actions from 'redux/actions'

import Row from './Row/Row'
import Table from 'components/Table/Table'


export default class Orders extends Component {

  state = {
    orders: swapApp.services.orders.items,
  }

  componentWillMount() {
    actions.analytics.dataEvent('open-page-orders')
    swapApp.services.orders
      .on('new orders', this.updateOrders)
      .on('new order', this.updateOrders)
      .on('order update', this.updateOrders)
      .on('remove order', this.updateOrders)
  }

  componentWillUnmount() {
    swapApp.services.orders
      .off('new orders', this.updateOrders)
      .off('new order', this.updateOrders)
      .off('order update', this.updateOrders)
      .off('remove order', this.updateOrders)
  }

  updateOrders = () => {
    this.setState({
      orders: swapApp.services.orders.items,
    })

    const { orders } = this.state

    if (orders.length !== 0) {
      actions.feed.getFeedDataFromOrder(orders)
    }
  }

  filterOrders = (orders, filter) =>
    orders.filter(f => (`${f.buyCurrency.toLowerCase()}${f.sellCurrency.toLowerCase()}` === filter))

  render() {
    const titles = [ 'EXCHANGE', 'YOU BUY', 'YOU SELL', 'EXCHANGE RATE', '' ]
    const { orders } = this.state
    const { filter } = this.props
    const filteredOrders = this.filterOrders(orders, filter)

    return (
      <Table
        titles={titles}
        rows={filteredOrders}
        rowRender={(row, index) => (
          <Row
            key={index}
            row={row}
            update={this.updateOrders}
          />
        )}
      />
    )
  }
}

