import React, { Component } from 'react'

import SwapApp from 'swap.app'
import actions from 'redux/actions'
import { connect } from 'redaction'
import metamask from 'helpers/metamask'
import { onInit as onSwapCoreInited } from 'instances/newSwap'


@connect(({ pubsubRoom }) => ({ pubsubRoom }))
export default class Core extends Component<any, any> {
  _mounted = true
  state = {
    orders: [],
  }

  componentDidMount() {
    onSwapCoreInited(() => {
      if (!this._mounted) return
      actions.core.getSwapHistory()
      //@ts-ignore: strictNullChecks
      SwapApp.shared().services.orders
        .on('new orders', this.updateOrders)
        .on('new order', this.updateOrders)
        .on('order update', this.updateOrders)
        .on('remove order', this.updateOrders)
        .on('new order request', this.updateOrders)
      this.setPubsub()
    })
  }

  componentWillUnmount() {
    this._mounted = false
    try {
      //@ts-ignore: strictNullChecks
      SwapApp.shared().services.orders
        .off('new orders', this.updateOrders)
        .off('new order', this.updateOrders)
        .off('order update', this.updateOrders)
        .off('remove order', this.updateOrders)
        .off('new order request', this.updateOrders)

      //@ts-ignore: strictNullChecks
      if (SwapApp.shared().services.room.connection) {
        console.log('leave room')
        //@ts-ignore: strictNullChecks
        SwapApp.shared().services.room.connection
          .removeListener('peer joined', actions.pubsubRoom.userJoined)
          .removeListener('peer left', actions.pubsubRoom.userLeft)
        //@ts-ignore: strictNullChecks
        SwapApp.shared().services.room.connection.leave()
      }
    } catch (e) {
      console.warn('Core unmount - not inited. skip')
    }
  }

  setPubsub = () => {
    const setupPubSubRoom = () => {
      try {
        const { pubsubRoom } = this.props

        if (pubsubRoom.isOnline) return

        //@ts-ignore: strictNullChecks
        if (!SwapApp.shared().services.room.connection) {
          throw new Error(`SwapRoom not ready`)
        }

        //@ts-ignore: strictNullChecks
        const isOnline = SwapApp.shared().services.room.connection.isOnline()
        //@ts-ignore: strictNullChecks
        const { peer } = SwapApp.shared().services.room

        this.updateOrders()

        actions.core.initPartialOrders()

        if (actions.core.hasHiddenOrders()) {
          actions.core.showMyOrders()
        }

        //@ts-ignore: strictNullChecks
        SwapApp.shared().services.room.connection
          .on('peer joined', actions.pubsubRoom.userJoined)
          .on('peer left', actions.pubsubRoom.userLeft)

        // BTC Multisign
        //@ts-ignore: strictNullChecks
        SwapApp.shared().services.room.on('btc multisig join', actions.btcmultisig.onUserMultisigJoin)

        clearInterval(pubsubLoadingInterval)

        actions.pubsubRoom.set({
          isOnline,
          peer,
        })
      } catch (error) {
        console.warn('pubsubRoom setup:', error)
      }
    }

    //@ts-ignore: strictNullChecks
    SwapApp.shared().services.room.on('ready', setupPubSubRoom)

    const pubsubLoadingInterval = setInterval(setupPubSubRoom, 5000)
  }

  updateOrders = () => {
    //@ts-ignore: strictNullChecks
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
