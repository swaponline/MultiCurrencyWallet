import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { withRouter } from 'react-router'
import actions from 'redux/actions'
import { connect } from 'redaction'
import { constants } from 'helpers'

import styles from './User.scss'
import CSSModules from 'react-css-modules'
import Sound from 'helpers/Sound/alert.mp4'

import Question from './Question/Question'
import UserAvatar from './UserAvatar/UserAvatar'
import UserTooltip from './UserTooltip/UserTooltip'
import SignUpButton from './SignUpButton/SignUpButton'

import links from 'helpers/links'

import Avatar from 'components/Avatar/Avatar'
import { FormattedMessage, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import ReactTooltip from 'react-tooltip'

import config from 'app-config'


@withRouter
@injectIntl
@connect({
  feeds: 'feeds.items',
  peer: 'ipfs.peer',
  isSigned: 'signUp.isSigned',
  reputation: 'ipfs.reputation',
})
@CSSModules(styles, { allowMultiple: true })
export default class User extends React.Component {

  static propTypes = {
    feeds: PropTypes.array.isRequired,
    peer: PropTypes.string.isRequired,
    declineRequest: PropTypes.func.isRequired,
    acceptRequest: PropTypes.func.isRequired,
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
    const { history } = this.props

    const isWidgetHash = history.location.pathname.includes('/exchange/') && history.location.hash === '#widget'
    const isWidgetBuild = config && config.isWidget
    const isWidget = (isWidgetBuild || isWidgetHash)

    const reputationPlaceholder = '0'

    const {
      feeds, peer, reputation, openTour, path, isSigned,
    } = this.props

    return (
      <div styleName="user-cont">
        {!isSigned && !isWidget && (<SignUpButton />)}
        {path && !isWidget && (<Question openTour={openTour} />)}
        {
          (!isWidget) && (
            <UserAvatar
              isToggle={this.handleToggleTooltip}
              feeds={feeds}
              declineRequest={this.props.declineRequest}
              getInfoBySwapId={actions.core.getInformationAboutSwap}
              soundClick={this.soundClick}
              changeView={this.handleChangeView}
            />
          )
        }
        {
          view && <UserTooltip
            feeds={feeds}
            peer={peer}
            toggle={this.handleToggleTooltip}
            acceptRequest={this.props.acceptRequest}
            declineRequest={this.props.declineRequest}
          />
        }
        {!!peer && !isWidget && (
          <Fragment>
            <div
              styleName="avatar-container"
              {...Number.isInteger(reputation) && reputation !== 0
                ? {
                  'data-tip': true,
                  'data-for': 'gravatar',
                }
                : {}
              }
            >
              <Avatar
                className={styles.avatar}
                value={peer}
                size={40}
              />
              <div styleName={`avatar-reputation-centered${!Number.isInteger(reputation) || reputation === 0 ? ' noBg' : ''}`}>
                { Number.isInteger(reputation) && reputation !== 0
                  ? reputation
                  : (
                    <a href={links.telegram} target="_blank" rel="noopener noreferrer">
                      <i styleName="icon" className="fab fa-telegram-plane" />
                    </a>
                  )
                }
              </div>
            </div>
            <ReactTooltip id="gravatar" effect="solid">
              <span>
                <FormattedMessage
                  id="avatar24"
                  defaultMessage="This is your (personal) gravatar, it is unique for each user.
                  The number is your rating within the system (it grows with the number of successful swaps)"
                />
              </span>
            </ReactTooltip>
          </Fragment>
        )}
      </div>
    )
  }
}
