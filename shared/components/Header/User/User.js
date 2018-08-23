import React from 'react'

import { withRouter } from 'react-router'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { constants } from 'helpers'

import styles from './User.scss'
import CSSModules from 'react-css-modules'
import Sound from 'helpers/Sound/Sound.mp4'

import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'
import AddOfferButton from './AddOfferButton/AddOfferButton'


@withRouter
@connect({
  feeds: 'feeds.items',
  peer: 'ipfs.peer',
})
@CSSModules(styles)
export default class User extends React.Component {

  state = {
    view: true,
  }

  handleChangeView = () => {
    this.setState({ view: true })
  }

  handleToggleTooltip = () => {
    this.setState({
      view: !this.state.view,
    })
  }

  declineRequest = (orderId, participantPeer) => {
    actions.core.declineRequest(orderId, participantPeer)
    actions.core.updateCore()
  }

  acceptRequest = (orderId, participantPeer) => {
    actions.core.acceptRequest(orderId, participantPeer)
    actions.core.updateCore()
    this.handleToggleTooltip()
  }

  autoAcceptRequest = (orderId, participantPeer, link) => {
    this.acceptRequest(orderId, participantPeer)
    setTimeout(() => {
      this.props.history.push(link)
    }, 1000)
  }

  soundClick = () => {
    let audio = new Audio()
    audio.src = Sound
    audio.autoplay = true
  }


  render() {
    const { view } = this.state
    const { feeds, peer } = this.props

    return (
      <div styleName="user-cont">
        <AddOfferButton />
        <UserAvatar
          isToggle={this.handleToggleTooltip}
          feeds={feeds}
          mePeer={peer}
          soundClick={this.soundClick}
          changeView={this.handleChangeView}
        />
        {
          view && <UserTooltip
            view={view}
            feeds={feeds}
            mePeer={peer}
            autoAcceptRequest={this.autoAcceptRequest}
            acceptRequest={this.acceptRequest}
            declineRequest={this.declineRequest}
          />
        }
      </div>
    )
  }
}
