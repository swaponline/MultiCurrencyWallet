import React from 'react'

import { createSwapApp, swapApp } from 'instances/swap'
import { connect } from 'redaction'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'

import FeedNotification from './FeedNotification/FeedNotification'


@connect({
  feeds: 'feeds.items',
})
export default class Feed extends React.Component {

  acceptRequest = (orderId, participantPeer) => {
    const order = swapApp.orderCollection.getByKey(orderId)

    order.acceptRequest(participantPeer)
  }

  declineRequest = (orderId, participantPeer) => {
    const order = swapApp.orderCollection.getByKey(orderId)

    order.declineRequest(participantPeer)
  }

  render() {
    const { feeds } = this.props
    const mePeer = swapApp.storage.me.peer

    return (
      <section>
        <PageHeadline>
          <SubTitle>
            Feed
          </SubTitle>
        </PageHeadline>
        <FeedNotification
          feeds={feeds}
          mePeer={mePeer}
          acceptRequest={this.acceptRequest}
          declineRequest={this.declineRequest}
          update={this.updateOrders}
        />
      </section>
    )
  }
}
