import React from 'react'

import SwapApp  from 'swap.app'

import actions from 'redux/actions'
import { connect } from 'redaction'
import { constants } from 'helpers'

import styles from './User.scss'
import CSSModules from 'react-css-modules'
import Sound from 'helpers/Sound/Sound.mp4'

import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'
import AddOfferButton from './AddOfferButton/AddOfferButton'


@connect({
  feeds: 'feeds.items',
})
@CSSModules(styles)
export default class User extends React.Component {

  state = {
    view: true,
  }

  componentWillMount() {
    SwapApp.services.orders.on('new order request', this.updateOrders)
  }

  componentWillUnmount() {
    SwapApp.services.orders.off('new order request', this.updateOrders)
  }

  handleChangeView = () => {
    this.setState({ view: true })
  }

  updateOrders = () => {
    this.setState({
      orders: SwapApp.services.orders.items,
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
    const order = SwapApp.services.orders.getByKey(orderId)
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
    const mePeer = SwapApp.services.room.peer

    return (
      <div styleName="user-cont">
        <AddOfferButton />
        <UserAvatar
          isToggle={this.handleToggleTooltip}
          feeds={feeds}
          mePeer={mePeer}
          soundClick={this.soundClick}
          changeView={this.handleChangeView}
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
