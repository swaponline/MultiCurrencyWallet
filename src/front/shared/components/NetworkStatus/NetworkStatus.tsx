import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import { connect } from 'redaction'
import styles from './NetworkStatus.scss'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import { FormattedMessage } from 'react-intl'

@connect(
  ({
    pubsubRoom,
  }) => ({
    isOnline: pubsubRoom.isOnline,
    onlineUsers: pubsubRoom.onlineUsers,
  })
)
@cssModules(styles, { allowMultiple: true })
export default class NetworkStatus extends React.Component<any, any> {

  props: any

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
          <span styleName="status">Offline</span>
        }
        {
          isOnline && (onlineUsers === 0
            ? <span styleName="status">Connecting...</span>
            : <span styleName="status">{`${onlineUsers} peers online`}</span>)
        }
        <Tooltip id="NetworkStatusPeersOnlineTooltip">
          <div style={{ maxWidth: '24em', textAlign: 'center' }}>
            <FormattedMessage
              id="NetworkStatusPeersOnlineMessage"
              defaultMessage="We do not have a centralized server for storing orders, we use the libp2p network from Protocol Labs, which works by analogy with the torrent network, every user (including you) is a peer in this network"
            />
          </div>
        </Tooltip>
      </div>
    )
  }
}
