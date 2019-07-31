import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Info.scss'

import ProgressBar from '../ProgressBar/ProgressBar'


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
      <div styleName="title">
        <span>
          ibp2p network status:
          <span styleName={isOnline ? 'connect' : 'disconnect'}>
            {isOnline ? ' Connected ' : ' Disconnected '}
          </span>
          {isOnline
            ? `to IPFS signal ${serverAddress} / peers online: ${onlinePeersHack}`
            : 'you cannot make exchanges until you are disconnected. Turn off VPN or try another network or browser'
          }
        </span>
        { isVisibleProgressBar && <ProgressBar handleClick={this.hideProgressBar} /> }
      </div>
    )
  }
}

export default cssModules(Info, styles, { allowMultiple: true })
