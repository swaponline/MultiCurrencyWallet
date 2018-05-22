import React from 'react'
import PropTypes from 'prop-types'
import { ignoreProps } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './Overlay.scss'


const Overlay = ({ children, ...rest }) => {
  const props = ignoreProps(rest, 'closePortal')

  return (
    <div styleName="overlay" {...props}>
      {children}
    </div>
  )
}

Overlay.propTypes = {
  children: PropTypes.node,
}

export default cssModules(Overlay, styles)
