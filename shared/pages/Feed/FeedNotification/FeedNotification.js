import React, { Component, Fragment } from 'react'

import { connect } from 'redaction'
import { swapApp } from 'instances/swap'
import actions from 'redux/actions'


@connect({
  orders: 'swap.orders',
})
export default class FeedNotification extends Component {

  render() {
    const { orders } = this.props
    const mePeer = swapApp.storage.me.peer

    return (
      <div>
        { orders.map(rows => {
          const { requests, isRequested, id, owner: { peer: ownerPeer } } = { ...rows }
          return (
            mePeer === ownerPeer ? (
              <Fragment>
                {
                  requests.map(({ peer, reputation }) => (
                    <div key={peer}>
                        User {peer} with <b>{reputation}</b> reputation wants to swap.
                      <button onClick={() => this.acceptRequest(id, peer)}>ACCEPT</button>
                      <button onClick={() => this.declineRequest(id, peer)}>DECLINE</button>
                    </div>
                  ))
                }
              </Fragment>
            ) : (
              null
            )
          )
        })
        }
      </div>
    )
  }
}
