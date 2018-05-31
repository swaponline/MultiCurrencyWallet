import React, { Component } from 'react'
import { swapApp } from 'instances/swap'

import Table from 'components/Table/Table'
import Coins from 'components/Coins/Coins'

import RequestButton from './RequestButton/RequestButton'


export default class Orders extends Component {

  constructor() {
    super()

    this.state = {
      orders: swapApp.orderCollection.items,
    }
  }

  componentWillMount() {
    swapApp.on('new orders', this.updateOrders)
    swapApp.on('new order', this.updateOrders)
    swapApp.on('remove order', this.updateOrders)
    swapApp.on('order update', this.updateOrders)
    swapApp.on('new order request', this.handleRequest)
  }

  componentWillUnmount() {
    swapApp.off('new orders', this.updateOrders)
    swapApp.off('new order', this.updateOrders)
    swapApp.off('remove order', this.updateOrders)
    swapApp.off('order update', this.updateOrders)
    swapApp.off('new order request', this.handleRequest)
  }

  updateOrders = () => {
    this.setState({
      orders: swapApp.orderCollection.items,
    })
  }

  handleRequest = ({ orderId, participant }) => {
    this.updateOrders()
  }

  createOrder = () => {
    const data = {
      buyCurrency: 'ETHTOKEN',
      sellCurrency: 'BTC',
      buyAmount: 1,
      sellAmount: 0.0012,
    }

    swapApp.createOrder(data)
    this.updateOrders()
  }

  removeOrder = (orderId) => {
    swapApp.removeOrder(orderId)
    this.updateOrders()
  }

  sendRequest = (orderId) => {
    const order = swapApp.orderCollection.getByKey(orderId)

    order.sendRequest((isAccepted) => {
      console.log(`user ${order.owner.peer} ${isAccepted ? 'accepted' : 'declined'} your request`)

      this.handleOrderSelect(orderId)
    })
    this.updateOrders()
  }

  acceptRequest = (orderId, participantPeer) => {
    const order = swapApp.orderCollection.getByKey(orderId)

    order.acceptRequest(participantPeer)
    this.handleOrderSelect(orderId)
    this.updateOrders()
  }

  declineRequest = (orderId, participantPeer) => {
    const order = swapApp.orderCollection.getByKey(orderId)

    order.declineRequest(participantPeer)
    this.updateOrders()
  }

  handleOrderSelect = (swapId) => {
    const { onOrderSelect } = this.props

    onOrderSelect(swapId)
  }


  render() {
    const titles = [ 'EXCHANGE', 'BUY', 'SELL', 'EXCHANGE RATE', '' ]
    const { orders } = this.state
    const { myPeer, activeOrderId } = this.props

    return (
      <Table
        titles={titles}
        rows={orders}
        myPeer={myPeer}
        activeOrderId={activeOrderId}
        cellRender={(cell, colIndex) => {
          if (colIndex === 0) {
            return (
              <Coins names={['eth', 'btc']}/>
            )
          }

          else if (colIndex === 4) {
            return (
              <RequestButton />
            )
          }

          return cell
        }}
      />
    )
  }
}
