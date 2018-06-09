import React from 'react'

import { connect } from 'redaction'
import { swapApp } from 'instances/newSwap'
import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './User.scss'

import Sound from './file/Sound.mp4'

// import Question from './controls/Question/Question'
import AddOfferButton from './AddOfferButton/AddOfferButton'
import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'


@connect({
  feeds: 'feeds.items',
})
@CSSModules(styles)
export default class User extends React.Component {

  state = {
    view: false,
  }

  componentWillMount() {
    swapApp.services.orders
      .on('new order request', this.updateOrders)
  }

  componentWillUnmount() {
    swapApp.services.orders
      .off('new order request', this.updateOrders)
  }

  updateOrders = () => {
    this.setState({
      orders: swapApp.services.orders.items,
    })

    const { orders } = this.state

    if (orders.length !== 0) {
      actions.feed.getFeedDataFromOrder(orders)
    }
  }

  handleToggleTooltip = () => {
    this.setState({
      view: !this.state.view,
    })
  }

  acceptRequest = (orderId, participantPeer) => {
    const order = swapApp.services.orders.getByKey(orderId)

    order.acceptRequest(participantPeer)

    setTimeout(() => {
      this.handleToggleTooltip()
    }, 800)

    this.updateOrders()
  }

  soundClick = () => {
    let audio = new Audio()
    audio.src = Sound
    audio.autoplay = true
  }

  render() {
    const { view } = this.state
    const { feeds } = this.props
    const mePeer = swapApp.services.room.peer

    return (
      <div styleName="user-cont">
        {/*/!* <Question /> *!/*/}
        <AddOfferButton />
        <UserAvatar
          isToggle={this.handleToggleTooltip}
          feeds={feeds}
          mePeer={mePeer}
          soundClick={this.soundClick}
        />
        {
          view && <UserTooltip
            view={view}
            feeds={feeds}
            mePeer={mePeer}
            acceptRequest={this.acceptRequest}
          />
        }
      </div>
    )
  }
}
