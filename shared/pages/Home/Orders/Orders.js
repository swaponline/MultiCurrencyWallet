import React, { Component } from 'react'
import { swapApp } from 'instances/swap'
import actions from 'redux/actions'

import Row from './Row/Row'
import Table from 'components/Table/Table'


export default class Orders extends Component {

  state = {
    orders: swapApp.orderCollection.items,
  }

  componentWillMount() {
    swapApp.on('new orders', this.updateOrders)
    swapApp.on('new order', this.updateOrders)
    swapApp.on('order update', this.updateOrders)
    swapApp.on('remove order', this.updateOrders)
  }

  componentWillUnmount() {
    swapApp.off('new orders', this.updateOrders)
    swapApp.off('new order', this.updateOrders)
    swapApp.off('order update', this.updateOrders)
    swapApp.off('remove order', this.updateOrders)
  }

  updateOrders = () => {
    this.setState({
      orders: swapApp.orderCollection.items,
    })

    const { orders } = this.state

    if (orders.length !== 0) {
      actions.feed.getFeedDataFromOrder(orders)
    }
  }

  filterOrders = (orders, filter) =>
    orders.filter(f => (`${f.buyCurrency}${f.sellCurrency}` === filter))

  render() {
    const titles = [ 'EXCHANGE', 'BUY', 'SELL', 'EXCHANGE RATE', '' ]
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

