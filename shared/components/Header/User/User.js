import React from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router-dom'
import { connect } from 'redaction'

import styles from './User.scss'
import CSSModules from 'react-css-modules'
import Sound from 'helpers/Sound/Sound.mp4'

import Question from './Question/Question'
import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'
import AddOfferButton from './AddOfferButton/AddOfferButton'

import Avatar from 'components/Avatar/Avatar'


@withRouter
@connect({
  feeds: 'feeds.items',
  peer: 'ipfs.peer',
})
@CSSModules(styles)
export default class User extends React.Component {

  static propTypes = {
    feeds: PropTypes.array.isRequired,
    peer: PropTypes.string.isRequired,
  }

  static defaultProps = {
    peer: null,
    feeds: [],
  }

  state = {
    view: true,
    path: false,
  }

  componentWillReceiveProps(nextProps) {
    this.checkPath()
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

  checkPath = () => {
    const { history: { location: { pathname } } } = this.props
    const { path } = this.state
    if  (pathname === '/ru' || pathname === '/') {
      this.setState({
        path: true,
      })
    } else {
      this.setState({
        path: false,
      })
    }
  }

  render() {
    const { view, path } = this.state

    const { feeds, peer, reputation, openTour, history: { location: { pathname } } } = this.props

    return (
      <div styleName="user-cont">
        <AddOfferButton />
        {path && (<Question openTour={openTour} />)}
        <UserAvatar
          isToggle={this.handleToggleTooltip}
          feeds={feeds}
          soundClick={this.soundClick}
          changeView={this.handleChangeView}
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
            size={40}
          />
        )}
      </div>
    )
  }
}
