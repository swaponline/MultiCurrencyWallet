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
          isOnline && (onlineUsers <= 0
            ? <span styleName="status">Connecting...</span>
            : <span styleName="status">{`${onlineUsers} peers online`}</span>)
        }
        <span styleName='status-tooltip'>
          <Tooltip id="NetworkStatusPeersOnlineTooltip">
            <div style={{ maxWidth: '24em', textAlign: 'center' }}>
              <FormattedMessage
                id="NetworkStatusPeersOnlineMessage"
                defaultMessage="Searching for Peers and Offers can take a couple of minutes. We do not store the offers on a centralized server. Instead, we use libp2p network by Protocol Labs that works like a Torrent network, which means that each user such as yourself is a peer in this network. If no offers are found within a couple of minutes, it means that there are no matching offers or a user who placed the offer is offline."
              />
            </div>
          </Tooltip>
        </span>
      </div>
    )
  }
}
