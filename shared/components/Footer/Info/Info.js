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

    return (
      <div styleName="title">
        <span>
          <span styleName={isOnline ? 'connect' : 'disconnect'}>
            {isOnline ? 'Connected ' : 'Loading or not available '}
          </span>
          to IPFS signal {serverAddress} / peers online: {onlineUsers}
        </span>
        { isVisibleProgressBar && <ProgressBar handleClick={this.hideProgressBar} /> }
      </div>
    )
  }
}

export default cssModules(Info, styles, { allowMultiple: true })
