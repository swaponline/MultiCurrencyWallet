import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Info.scss'


const Info = ({ onlineUsers, isOnline, serverAddress }) => (
  <div styleName="title">
    <span styleName={isOnline ? 'connect' : 'disconnect'}>
      {isOnline ? 'Connected ' : 'Loading or not available '}
    </span>
    to IPFS signal {serverAddress} / peers online: {onlineUsers}
  </div>
)

export default cssModules(Info, styles, { allowMultiple: true })
