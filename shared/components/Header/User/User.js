import React from 'react'

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
  peer: 'ipfs.peer',
})
@CSSModules(styles)
export default class User extends React.Component {

  state = {
    view: true,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState()
    }
  }

  handleChangeView = () => {
    this.setState({ view: true })
  }

  handleToggleTooltip = () => {
    this.setState({
      view: !this.state.view,
    })
  }

  acceptRequest = (orderId, participantPeer) => {
    actions.core.acceptRequest(orderId, participantPeer)
    actions.core.updateCore()
    this.handleToggleTooltip()
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
            acceptRequest={this.acceptRequest}
          />
        }
      </div>
    )
  }
}
