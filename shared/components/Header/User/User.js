import React from 'react'

import { connect } from 'redaction'
import SwapApp from 'swap.app'
import actions from 'redux/actions'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './User.scss'

import Sound from 'helpers/Sound/Sound.mp4'
// import Question from './controls/Question/Question'
import AddOfferButton from './AddOfferButton/AddOfferButton'
import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'

import MenuIcon from 'components/ui/MenuIcon/MenuIcon'
import NavMobile from '../NavMobile/NavMobile'


@connect({
  feeds: 'feeds.items',
})
@CSSModules(styles)
export default class User extends React.Component {

  state = {
    view: true,
    menuVisible: false,
  }

  componentWillMount() {
    SwapApp.services.orders
      .on('new order request', this.updateOrders)
  }

  componentWillUnmount() {
    SwapApp.services.orders
      .off('new order request', this.updateOrders)
  }

  componentDidMount() {
    setTimeout(() => {
      const peer = SwapApp.services.room.connection._peers.length
      actions.notifications.show(constants.notifications.Message, { message: `IPFS: ${peer} peers connected` })
    }, 8000)
  }

  handleChangeView = () => {
    this.setState({
      view: true,
    })
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
    const { view, menuVisible } = this.state
    const { feeds } = this.props
    const mePeer = SwapApp.services.room.peer

    return (
      <div styleName="user-cont">
        {/*/!* <Question /> *!/*/}
        <MenuIcon onClick={() => this.setState({ menuVisible: !menuVisible })} />
        <NavMobile view={menuVisible} />
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
