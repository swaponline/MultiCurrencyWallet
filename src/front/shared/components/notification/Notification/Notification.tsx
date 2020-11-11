import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Notification.scss'

import Sound from 'helpers/Sound/alert.mp4'


@cssModules(styles, { allowMultiple: true })
export default class Notification extends Component<any, any> {

  static defaultProps = {
    soundPlay: true,
  }

  static childContextTypes = {
    close: PropTypes.func,
  }

  state = {
    mounted: false,
    removed: false,
  }

  componentDidMount() {
    if (this.props.soundPlay) {
      this.soundClick()
    }
    setTimeout(() => {
      this.setState({
        mounted: true,
      }, () => {
        setTimeout(this.close, 8000)
      })
    }, 0)
  }

  close = () => {
    const { name } = this.props

    this.setState({
      removed: true,
    }, () => {
      setTimeout(() => {
        actions.notifications.hide(name)
      }, 300)
    })
  }

  handleClick = () => {
    this.close()
    if (this.props.onClick) this.props.onClick()
  }

  soundClick = () => {
    let audio = new Audio()
    audio.src = Sound
    audio.autoplay = true
  }

  render() {
    const { mounted, removed } = this.state
    const { children, type, className } = this.props

    const containerStyleName = cx('container', {
      'mounted': mounted,
      'removed': removed,
    })

    const notificationStyleName = cx('notification', {
      'mounted': mounted,
      'removed': removed,
      'ErrorNotification': type === 'ErrorNotification',
    })

    return (
      <div styleName={containerStyleName}>
        <div styleName={notificationStyleName} onClick={this.handleClick}>
          <div styleName="content" className={className}>
            {children}
          </div>
        </div>
      </div>
    )
  }
}
