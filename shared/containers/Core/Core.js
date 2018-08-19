import React, { Component } from 'react'

import SwapApp from 'swap.app'
import actions from 'redux/actions'

import config from 'app-config'


export default class Core extends Component {

  componentWillReceiveProps(nextState) {
    if (nextState !== this.state) {
      this.setState()
    }
  }

  componentWillMount() {
    SwapApp.services.orders
      .on('new orders', this.updateOrders)
      .on('new order', this.updateOrders)
      .on('order update', this.updateOrders)
      .on('remove order', this.updateOrders)
      .on('new order request', this.updateOrders)
    this.setIpfs()
  }

  componentWillUnmount() {
    SwapApp.services.orders
      .off('new orders', this.updateOrders)
      .off('new order', this.updateOrders)
      .off('order update', this.updateOrders)
      .off('remove order', this.updateOrders)
      .off('new order request', this.updateOrders)
  }

  setIpfs = () => {
    setTimeout(() => {
      const isOnline = SwapApp.services.room.connection._ipfs.isOnline()
      const peer = SwapApp.services.room.peer

      SwapApp.services.room.connection.on('peer joined', actions.ipfs.userJoined)
      SwapApp.services.room.connection.on('peer left', actions.ipfs.userLeft)
      setTimeout(() => {
        actions.ipfs.set({
          isOnline,
          peer,
          server: config.ipfs.server,
        })
      }, 1000)
    }, 8000)
  }

  updateOrders = () => {
    const orders = SwapApp.services.orders.items
    actions.core.updateCore(orders)
  }

  render() {
    return null
  }
}
