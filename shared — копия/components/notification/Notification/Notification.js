import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import actions from 'redux/actions'

import cssModules from 'react-css-modules'
import styles from './Notification.scss'

import Sound from 'helpers/Sound/Sound.mp4'


@cssModules(styles, { allowMultiple: true })
export default class Notification extends Component {

  static childContextTypes = {
    close: PropTypes.func,
  }

  state = {
    mounted: false,
    removed: false,
  }

  componentDidMount() {
    this.soundClick()
    setTimeout(() => {
      this.setState({
        mounted: true,
      }, () => {
        setTimeout(this.close, 4000)
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

  soundClick = () => {
    let audio = new Audio()
    audio.src = Sound
    audio.autoplay = true
  }

  render() {
    const { mounted, removed } = this.state
    const { children, type } = this.props

    const containerStyleName = cx('container', {
      'mounted': mounted,
      'removed': removed,
    })

    const notificationStyleName = cx('notification', {
      'mounted': mounted,
      'removed': removed,
      'info': type === 'info',
      'success': type === 'success',
      'warning': type === 'warning',
      'error': type === 'error',
    })

    return (
      <div styleName={containerStyleName}>
        <div styleName={notificationStyleName} onClick={this.close}>
          <div styleName="content">
            {children}
          </div>
        </div>
      </div>
    )
  }
}
