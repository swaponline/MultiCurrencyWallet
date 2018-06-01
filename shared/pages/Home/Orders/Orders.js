import React, { Component } from 'react'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { swapApp } from 'instances/swap'

import Row from './Row/Row'
import Table from 'components/Table/Table'


@connect({
  orders: 'swap.orders',
})
export default class Orders extends Component {

  componentWillMount() {
    swapApp.on('new orders', this.updateOrders)
    swapApp.on('new order', this.updateOrders)
    swapApp.on('remove order', this.updateOrders)
  }

  componentWillUnmount() {
    swapApp.off('new orders', this.updateOrders)
    swapApp.off('new order', this.updateOrders)
    swapApp.off('remove order', this.updateOrders)
  }

  updateOrders = () => {
    actions.swap.update()
  }

  render() {
    const titles = [ 'EXCHANGE', 'BUY', 'SELL', 'EXCHANGE RATE', '' ]
    const { orders } = this.props

    console.log('orders', orders)
    return (
      <Table
        titles={titles}
        rows={orders}
        rowRender={(row, index) => (
          <Row
            key={index}
            row={row}
          />
        )}
      />
    )
  }
}

