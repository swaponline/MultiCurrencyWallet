import React, { Fragment, Component } from 'react'
import { constants } from 'swap.app'

import app from '../../swapApp'

export default class Orders extends Component {

  constructor() {
    super()

    this.app = app

    this.state = {
      orders: this.app.services.orders.items,
    }
  }

  componentWillMount() {
    this.app.services.orders
      .on('new orders', this.updateOrders)
      .on('new order', this.updateOrders)
      .on('remove order', this.updateOrders)
      .on('order update', this.updateOrders)
      .on('new order request', this.handleRequest)
  }

  componentWillUnmount() {
    this.app.services.orders
      .off('new orders', this.updateOrders)
      .off('new order', this.updateOrders)
      .off('remove order', this.updateOrders)
      .off('order update', this.updateOrders)
      .off('new order request', this.handleRequest)
  }

  updateOrders = () => {
    this.setState({
      orders: this.app.services.orders.items,
    })
  }

  handleRequest = ({ orderId, participant }) => {
    this.updateOrders()
  }

  createOrder = () => {
    const data = {
      buyCurrency: constants.COINS.eth,
      sellCurrency: constants.COINS.btc,
      buyAmount: 0.01,
      sellAmount: 0.0013,
    }

    this.app.services.orders.create(data)
    this.updateOrders()
  }

  removeOrder = (orderId) => {
    this.app.services.orders.remove(orderId)
    this.updateOrders()
  }

  sendRequest = (orderId) => {
    const order = this.app.services.orders.getByKey(orderId)

    order.sendRequest((isAccepted) => {
      console.log(`user ${order.owner.peer} ${isAccepted ? 'accepted' : 'declined'} your request`)

      this.handleOrderSelect(orderId)
    })
    this.updateOrders()
  }

  acceptRequest = (orderId, participantPeer) => {
    const order = this.app.services.orders.getByKey(orderId)

    order.acceptRequest(participantPeer)
    this.handleOrderSelect(orderId)
    this.updateOrders()
  }

  declineRequest = (orderId, participantPeer) => {
    const order = this.app.services.orders.getByKey(orderId)

    order.declineRequest(participantPeer)
    this.updateOrders()
  }

  handleOrderSelect = (orderId) => {
    const { onOrderSelect } = this.props

    onOrderSelect(orderId)
  }

  render() {
    const { orders } = this.state
    const { myPeer, activeOrderId } = this.props

    return (
      <div>
        <button onClick={this.createOrder}>Create Order</button>
        <br /><br />
        {
          Boolean(orders && orders.length) && (
            <table>
              <thead>
                <tr>
                  <th>Exchange Rate</th>
                  <th>User Reputation</th>
                  <th>{orders[0].sellCurrency.toUpperCase()}</th>
                  <th>{orders[0].buyCurrency.toUpperCase()}</th>
                  <th width="1%" colSpan="2" />
                </tr>
              </thead>
              <tbody>
                {
                  orders.map((order) => {
                    const {
                      id, buyAmount, sellAmount, exchangeRate, requests, isRequested, isProcessing,
                      owner: { peer: ownerPeer, reputation },
                    } = order

                    return (
                      <tr key={id} style={{ backgroundColor: myPeer === ownerPeer ? '#fff4d5' : '' }}>
                        <td>{exchangeRate}</td>
                        <td>{reputation}</td>
                        <td>{sellAmount.toNumber()}</td>
                        <td>{buyAmount.toNumber()}</td>
                        {
                          isProcessing ? (
                            <td>
                              <div style={{ color: 'red' }}>PROCESSING</div>
                              {
                                activeOrderId !== id && (
                                  <button onClick={() => this.handleOrderSelect(id)}>OPEN</button>
                                )
                              }
                            </td>
                          ) : (
                            <td>
                              {
                                myPeer === ownerPeer ? (
                                  <Fragment>
                                    {
                                      Boolean(requests && requests.length) ? (
                                        <Fragment>
                                          {
                                            requests.map(({ participant, reputation }) => (
                                              <div key={participant.peer}>
                                                User {participant.peer} with <b>{reputation}</b> reputation wants to swap.
                                                <button onClick={() => this.acceptRequest(id, participant.peer)}>ACCEPT</button>
                                                <button onClick={() => this.declineRequest(id, participant.peer)}>DECLINE</button>
                                              </div>
                                            ))
                                          }
                                        </Fragment>
                                      ) : (
                                        <button onClick={() => this.removeOrder(id)}>REMOVE</button>
                                      )
                                    }
                                  </Fragment>
                                ) : (
                                  <Fragment>
                                    {
                                      isRequested ? (
                                        <div style={{ color: 'red' }}>REQUESTING</div>
                                      ) : (
                                        <button onClick={() => this.sendRequest(id)}>BUY</button>
                                      )
                                    }
                                  </Fragment>
                                )
                              }
                            </td>
                          )
                        }
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          )
        }
      </div>
    )
  }
}
