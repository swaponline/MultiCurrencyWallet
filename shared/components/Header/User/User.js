import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { connect } from 'redaction'

import styles from './User.scss'
import CSSModules from 'react-css-modules'
import Sound from 'helpers/Sound/Sound.mp4'

import Question from './Question/Question'
import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'
import AddOfferButton from './AddOfferButton/AddOfferButton'

import Avatar from 'components/Avatar/Avatar'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


@connect({
  feeds: 'feeds.items',
  peer: 'ipfs.peer',
  reputation: 'ipfs.reputation',
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
    const { feeds, peer, reputation } = this.props

    return (
      <div styleName="user-cont">
        <AddOfferButton />
        <Question />
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
          <Fragment>
            <div styleName="avatar-container" data-tip data-for="gravatar">
              <Avatar
                className={styles.avatar}
                value={peer}
                size={40}
              />
              { Number.isInteger(reputation) && (
                <div styleName="avatar-reputation-centered">{reputation}</div>
              )}
            </div>
            <ReactTooltip id="gravatar" type="light" effect="solid" >
              <span>
                <FormattedMessage id="avatar24" defaultMessage="Automatically created gravatar. its unique for every profile. You can see your reputation at the center" />
              </span>
            </ReactTooltip>
          </Fragment>
        )}
      </div>
    )
  }
}
