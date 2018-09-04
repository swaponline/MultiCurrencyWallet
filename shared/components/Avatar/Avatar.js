import React from 'react'
import Identicon from 'identicon.js'

import CSSModules from 'react-css-modules'
import styles from './Avatar.scss'


const Avatar = ({ value, className, background, margin, size, format }) => {

  const options = {
    background,
    margin,
    size,
    format,
  }

  const data = new Identicon(value, options).toString()

  return (
    <img className={className} styleName="avatar" alt={value} src={`data:image/svg+xml;base64,${data}`} />
  )
}

Avatar.defaultProps = {
  background: [255, 255, 255, 255],
  margin: 0,
  size: 35,
  format: 'svg',
}

export default CSSModules(Avatar, styles)
