import React from 'react'

import SwapApp from 'swap.app'
import actions from 'redux/actions'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'

import FeedNotification from './FeedNotification/FeedNotification'
import Row from './Row/Row'


export default class Feed extends React.Component {

  state = {
    orders: SwapApp.services.orders.items,
  }

  componentWillMount() {
    actions.analytics.dataEvent('open-page-orders')
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

  acceptRequest = (orderId, participantPeer) => {
    const order = SwapApp.services.orders.getByKey(orderId)

    order.acceptRequest(participantPeer)
    this.updateOrders()
  }

  declineRequest = (orderId, participantPeer) => {
    const order = SwapApp.services.orders.getByKey(orderId)

    order.declineRequest(participantPeer)
    this.updateOrders()
  }

  removeOrder = (orderId) => {
    SwapApp.services.orders.remove(orderId)
    actions.feed.deleteItemToFeed(orderId)

    this.updateOrders()
  }

  render() {
    const { orders } = this.state
    const mePeer = SwapApp.services.room.peer

    return (
      <section>
        <PageHeadline>
          <SubTitle>
            Feed
          </SubTitle>
        </PageHeadline>
        <FeedNotification
          feeds={orders}
          rowRender={(row, index) => (
            <Row
              key={index}
              row={row}
              mePeer={mePeer}
              acceptRequest={this.acceptRequest}
              declineRequest={this.declineRequest}
              removeOrder={this.removeOrder}
              update={this.updateOrders}
            />
          )}
        />
      </section>
    )
  }
}
