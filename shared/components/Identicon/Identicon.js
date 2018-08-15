import React from 'react'
import Blockies from 'react-blockies'

import CSSModules from 'react-css-modules'
import styles from './Identicon.scss'

const Identicon = ({ hash }) => (
    <div styleName="identicon">
      <Blockies seed={hash} size={10} scale={4} />
    </div>
  )

export default CSSModules(Identicon, styles)
