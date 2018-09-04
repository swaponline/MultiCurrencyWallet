import React from 'react'
import { connect } from 'redaction'

import styles from './User.scss'
import CSSModules from 'react-css-modules'
import Sound from 'helpers/Sound/Sound.mp4'

import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'
import AddOfferButton from './AddOfferButton/AddOfferButton'
import Avatar from 'components/Avatar/Avatar'


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
          soundClick={this.soundClick}
          changeView={this.handleChangeView}
          peer={peer}
        />
        {
          view && <UserTooltip
            toggle={this.handleToggleTooltip}
          />
        }
        {!!peer && (
          <Avatar
            className={styles.avatar}
            value={peer}
            background={[81, 14, 216, 255]}
            size={40}
          />
        )}
      </div>
    )
  }
}
