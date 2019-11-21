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
    SwapApp.shared().services.orders
      .on('new orders', this.updateOrders)
      .on('new order', this.updateOrders)
      .on('order update', this.updateOrders)
      .on('remove order', this.updateOrders)
      .on('new order request', this.updateOrders)
    this.setIpfs()
  }

  componentWillUnmount() {
    SwapApp.shared().services.orders
      .off('new orders', this.updateOrders)
      .off('new order', this.updateOrders)
      .off('order update', this.updateOrders)
      .off('remove order', this.updateOrders)
      .off('new order request', this.updateOrders)
    if (SwapApp.shared().services.room.connection) {
      console.log('leave room')
      SwapApp.shared().services.room.connection
        .removeListener('peer joined', actions.ipfs.userJoined)
        .removeListener('peer left', actions.ipfs.userLeft)
      SwapApp.shared().services.room.connection.leave()
    }
  }

  setIpfs = () => {
    const setupIPFS = () => {
      try {
        const { ipfs } = this.props

        if (ipfs.isOnline) return

        if (!SwapApp.shared().services.room.connection) {
          throw new Error(`SwapRoom not ready`)
        }

        const isOnline = SwapApp.shared().services.room.connection._ipfs.isOnline()
        const { peer } = SwapApp.shared().services.room

        this.updateOrders()

        actions.core.initPartialOrders()

        if (actions.core.hasHiddenOrders()) {
          actions.core.showMyOrders()
        }

        SwapApp.shared().services.room.connection
          .on('peer joined', actions.ipfs.userJoined)
          .on('peer left', actions.ipfs.userLeft)

        // BTC Multisign
        SwapApp.shared().services.room.on('btc multisig join', actions.btcmultisig.onUserMultisigJoin)
        SwapApp.shared().services.room.on('btc multisig send', actions.btcmultisig.onUserMultisigSend)

        clearInterval(ipfsLoadingInterval)

        actions.ipfs.set({
          isOnline,
          peer,
        })
      } catch (error) {
        console.warn('IPFS setup:', error)
      }
    }

    SwapApp.shared().services.room.on('ready', setupIPFS)

    const ipfsLoadingInterval = setInterval(setupIPFS, 5000)
  }

  updateOrders = () => {
    const orders = SwapApp.shared().services.orders.items
    this.setState(() => ({
      orders,
    }))
    actions.core.updateCore()
  }

  render() {
    return null
  }
}
