import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Info.scss'
import { constants } from 'helpers'

import ProgressBar from '../ProgressBar/ProgressBar'


const isDark = localStorage.getItem(constants.localStorage.isDark)
class Info extends React.Component {

  static propTypes = {
    serverAddress: PropTypes.string.isRequired,
    isOnline: PropTypes.bool.isRequired,
    onlineUsers: PropTypes.number,
  }

  static defaultProps = {
    serverAddress: 'array.io',
    isOnline: false,
    onlineUsers: 1,
  }

  constructor() {
    super()

    this.state = {
      isVisibleProgressBar: true,
    }
  }

  hideProgressBar = () => {
    this.setState(() => ({ isVisibleProgressBar: false }))
  }

  render() {
    const { isOnline, serverAddress, onlineUsers } = this.props
    const { isVisibleProgressBar } = this.state

    const onlinePeersHack = onlineUsers >= 0 ? onlineUsers : 1

    return (
      <div styleName={`title ${isOnline ? 'online' : 'offline'} ${isDark ? '--dark' : ''}`}>
        <em></em>
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
        
        <div>
          libp2p network status:
          {' '}
          <span>
            <span styleName={isOnline ? 'connect' : 'disconnect'}>
              {isOnline
                ? 'Connected'
                : 'Disconnected. You cannot make exchanges until you are disconnected. Turn off VPN or try another network or browser'}
            </span>
          </span>
          {isVisibleProgressBar && <ProgressBar handleClick={this.hideProgressBar} />}
        </div>
      </div>
    )
  }
}

export default cssModules(Info, styles, { allowMultiple: true })
