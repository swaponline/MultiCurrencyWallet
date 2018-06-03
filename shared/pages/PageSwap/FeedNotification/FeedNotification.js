import React, { Component, Fragment } from 'react'

import actions from 'redux/actions'
import { swapApp } from 'instances/swap'


export default class FeedNotification extends Component {

  acceptRequest = (orderId, participantPeer) => {
    actions.swap.acceptRequest(orderId, participantPeer)
  }

  declineRequest = (orderId, participantPeer) => {
    actions.swap.declineRequest(orderId, participantPeer)
  }

  render() {
    const { orders } = this.props
    const mePeer = swapApp.storage.me.peer

    return (
      <div>
        {
          orders.filter(rows => rows.requests.length !== 0)
            .map(row => {
              const { requests, id, owner: { peer: ownerPeer } } = row
              console.log('requests', requests)
              return (
                mePeer === ownerPeer ? (
                  <Fragment>
                    {
                      requests.map(({ peer, reputation }) => {
                        console.log('peer', peer)
                        return (
                          <div key={peer}>
                            User {peer} with <b>{reputation}</b> reputation wants to swap.
                            <button onClick={() => this.acceptRequest(id, peer)}>ACCEPT</button>
                            <button onClick={() => this.declineRequest(id, peer)}>DECLINE</button>
                          </div>
                        )
                      })
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
