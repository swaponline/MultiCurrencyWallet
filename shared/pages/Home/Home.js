import React, { Component } from 'react'
import { swapApp } from 'instances/swap'

import PageHeadline from 'components/PageHeadline/PageHeadline'
import Title from 'components/PageHeadline/Title/Title'
import SubTitle from 'components/PageHeadline/SubTitle/SubTitle'
import Href from 'components/Href/Href'

import Orders from './Orders/Orders'


export default class Home extends Component {

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
      const myPeer = swapApp.storage.me.peer

      return (
        <section>
          <PageHeadline>
            <Title>Swap.Online</Title>
            <SubTitle>
              We are working to start swap.online as soon as possible.<br />
              Subscribe to <Href tab="https://t.me/swaponlineint">telegram</Href> and <Href redirect="/">mailing list</Href>
            </SubTitle>
          </PageHeadline>
          <Orders
            myPeer={myPeer}
            activeOrderId={activeOrderId}
            onOrderSelect={this.handleSelectOrder}
          />
          {/*<Swap orderId={activeOrderId} />*/}
        </section>
      )
  }
}

