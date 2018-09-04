import React from 'react'
import Identicon from 'identicon.js'

import CSSModules from 'react-css-modules'
import styles from './Avatar.scss'


const Avatar = ({ value, className, background, margin, size, format }) => {
  const data = new Identicon(value, {
    background,
    margin,
    size,
    format,
  }).toString()

  return (
    <img className={className} alt={value} src={`data:image/svg+xml;base64,${data}`} />
  )
}

Avatar.defaultProps = {
  background: [255, 255, 255, 255],
  margin: 0,
  size: 40,
  format: 'svg',
}

export default CSSModules(Avatar, styles)