import React, { Component } from 'react'

import Orders from './Orders/Orders'
import Swap from './Swap/Swap'

import app from '../swapApp'

export default class App extends Component {

  constructor() {
    super()

    this.app = app
  }

  state = {
    activeOrderId: null,
  }

  handleSelectOrder = (orderId) => {
    this.setState({
      activeOrderId: orderId,
    })
  }

  render() {
    const { activeOrderId } = this.state
    const myPeer = this.app.services.room.peer

    return (
      <div className="content">
        <Orders
          myPeer={myPeer}
          activeOrderId={activeOrderId}
          onOrderSelect={this.handleSelectOrder}
        />
        <Swap orderId={activeOrderId} />
      </div>
    )
  }
}
