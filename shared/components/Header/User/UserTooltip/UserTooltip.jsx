import React, { Component, Fragment } from 'react'

import { swapApp } from 'instances/swap'

import { links } from 'helpers'
import { Link } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './UserTooltip.scss'

import ArrowRightSvg from './images/arrow-right.svg'


@CSSModules(styles)
export default class UserTooltip extends Component {

  constructor() {
    super()

    this.state = {
      swap: swapApp.orderCollection.items,
    }
  }

  componentWillMount() {
    swapApp.on('new order request', this.updateOrders)
  }

  componentWillUnmount() {
    swapApp.off('new order request', this.updateOrders)
  }

  acceptRequest = (orderId, participantPeer) => {
    const { isClose } = this.props
    const order = swapApp.orderCollection.getByKey(orderId)

    order.acceptRequest(participantPeer)

    this.updateOrders()

    setTimeout(() => {
      isClose()
    }, 800)
  }

  updateOrders = () => {
    this.setState({
      swap: swapApp.orderCollection.items,
    })
  }

  render() {
    const { swap } = this.state
    const mePeer = swapApp.storage.me.peer

    return (
      <div styleName="userTooltip">
        {
          swap.filter(rows => rows.requests.length !== 0)
            .map(row => {
              const { requests, buyAmount, buyCurrency, sellAmount, sellCurrency,  id, owner: { peer: ownerPeer } } = row

              return (
                mePeer === ownerPeer &&
              requests.map(({ peer, reputation }) => (
                <Fragment>
                  <div key={peer}>
                    <div styleName="title">User with <b>{reputation}</b> reputation wants to swap</div>
                    <div styleName="currency">
                      <span>{buyAmount} <span styleName="coin">{buyCurrency}</span></span>
                      <span styleName="arrow"><img src={ArrowRightSvg} alt="" /></span>
                      <span>{sellAmount} <span styleName="coin">{sellCurrency}</span></span>
                    </div>
                  </div>
                  <Link to={`${links.swap}/${id}`}>
                    <div styleName="checked" onClick={() => this.acceptRequest(id, peer)} />
                  </Link>
                </Fragment>
              ))
              )
            })
        }
      </div>
    )
  }
}
