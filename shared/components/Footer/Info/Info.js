import React from 'react'

import cssModules from 'react-css-modules'
import styles from './Info.scss'


const Info = ({ userOnline, connected, serverAddress }) => (
  <div styleName="title">
    <span styleName={connected ? 'connect' : 'disconnect'}>
      {connected ? 'Connected ' : 'Loading or not available '}
    </span>
    to IPFS signal {serverAddress} / peers online: {userOnline}
  </div>
)

export default cssModules(Info, styles, { allowMultiple: true })
