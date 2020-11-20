import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import jdenticon from 'jdenticon'

import CSSModules from 'react-css-modules'
import styles from './Avatar.scss'


const Avatar = ({ value, className, size }) => (
  <Fragment>
    <img
      className={className}
      styleName="avatar"
      alt={value}
      title={value}
      src={`data:image/svg+xml,${encodeURIComponent(jdenticon.toSvg(value, size))}`}
    />
  </Fragment>
)

Avatar.defaultProps = {
  size: 35,
}

Avatar.propTypes = {
  value: PropTypes.string.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
}

export default CSSModules(Avatar, styles)
