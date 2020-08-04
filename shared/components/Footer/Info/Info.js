import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Info.scss'
import { constants } from 'helpers'


class Info extends React.Component {

  static propTypes = {
    isOnline: PropTypes.bool.isRequired,
    onlineUsers: PropTypes.number,
  }

  static defaultProps = {
    isOnline: false,
    onlineUsers: 1,
  }

  render() {
    const { isOnline, onlineUsers } = this.props

    const onlinePeersHack = onlineUsers >= 0 ? onlineUsers : 1

    return (
      <div styleName={`title ${isOnline ? 'online' : 'offline'}`}>
        <em styleName="mark"></em>
        {!isOnline &&
          <span>Offline</span>
        }
        {
          isOnline && (onlineUsers === 0
          ?
          <span>Connecting...</span>
          :
          <span>{`${onlineUsers} peers online`}</span>)
        }
      </div>
    )
  }
}

export default cssModules(Info, styles, { allowMultiple: true })
