import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Info.scss'


const Info = ({ userOnline, connected = true, serverAddress }) => (
  <div styleName="title">
    Users online: {userOnline} <span styleName={connected ? 'connect' : 'disconnect'}>{connected ? 'Connected' : 'Not available'}</span> to IPFS signal {serverAddress}
  </div>
)

export default cssModules(Info, styles, { allowMultiple: true })
