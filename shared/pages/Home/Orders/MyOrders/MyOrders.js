import React, { PureComponent, Fragment } from 'react'

import SwapApp from 'swap.app'
import actions from 'redux/actions'

import Table from 'components/Table/Table'
import RowFeeds from './RowFeeds/RowFeeds'


export default class MyOrders extends PureComponent {

  acceptRequest = (orderId, participantPeer) => {
    const order = SwapApp.services.orders.getByKey(orderId)

    order.acceptRequest(participantPeer)
    this.props.updateOrders()
  }

  declineRequest = (orderId, participantPeer) => {
    const order = SwapApp.services.orders.getByKey(orderId)

    order.declineRequest(participantPeer)
    this.props.updateOrders()
  }

  removeOrder = (orderId) => {
    SwapApp.services.orders.remove(orderId)
    actions.feed.deleteItemToFeed(orderId)

    this.props.updateOrders()
  }

  render() {
    const titles = [ 'EXCHANGE', 'YOU BUY', 'YOU SELL', 'EXCHANGE RATE', 'ACTIONS' ]

    const { orders } = this.props

    if (orders.length <= 0 || orders.length === undefined) {
      return null
    }

    console.log(orders)

    return (
      <Fragment>
        <h3 style={{ marginTop: '50px' }} >Your orders</h3>
        <Table
          titles={titles}
          rows={orders}
          rowRender={(row, index) => (
            <RowFeeds
              key={index}
              row={row}
              acceptRequest={this.acceptRequest}
              declineRequest={this.declineRequest}
              removeOrder={this.removeOrder}
              update={this.updateOrders}
            />
          )}
        />
      </Fragment>
    )
  }
}

