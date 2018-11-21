import React, { Component } from 'react'

import SwapApp from 'swap.app'
import actions from 'redux/actions'
import { connect } from 'redaction'

@connect(({ ipfs }) => ({ ipfs }))
export default class Core extends Component {

  state = {
    orders: [],
  }

  componentWillMount() {
    actions.core.getSwapHistory()
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
    if (SwapApp.services.room.connection) {
      console.log('leave room')
      SwapApp.services.room.connection
        .removeListener('peer joined', actions.ipfs.userJoined)
        .removeListener('peer left', actions.ipfs.userLeft)
      SwapApp.services.room
        .off('request partial closure', this.createOrder)
      SwapApp.services.room.connection.leave()
    }
  }

  setIpfs = () => {
    const setupIPFS = () => {
      try {
        const { ipfs } = this.props

        console.log('ipfs', ipfs)
        if (ipfs.isOnline) return

        if (!SwapApp.services.room.connection) {
          throw new Error(`SwapRoom not ready`)
        }

        const isOnline = SwapApp.services.room.connection._ipfs.isOnline()
        const { peer } = SwapApp.services.room

        this.updateOrders()


        SwapApp.services.room.connection
          .on('peer joined', actions.ipfs.userJoined)
          .on('peer left', actions.ipfs.userLeft)

        clearInterval(ipfsLoadingInterval)
        console.log('ipfs loaded')

      SwapApp.services.room
        .on('request partial closure', this.createOrder)

        actions.ipfs.set({
          isOnline,
          peer,
        })
      } catch (err) {
        console.error('IPFS setup error', err)
      }
    }

    SwapApp.services.room.once('ready', setupIPFS)

    const ipfsLoadingInterval = setInterval(setupIPFS, 5000)
  }

  updateOrders = () => {
    const orders = SwapApp.services.orders.items
    this.setState(() => ({
      orders,
    }))
    actions.core.updateCore(orders)
  }

  createOrder = async ({ fromPeer, order, ...rest }) => {
    console.log('rest', ...rest)
    // TODO add check exchange rate and format order
    const createdOrder = await actions.core.createOrder(order)
    actions.core.requestToPeer('accept request', fromPeer, { orderId: createdOrder.id })
  }

  render() {
    return null
  }
}
