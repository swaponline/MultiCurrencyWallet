import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import config from 'helpers/externalConfig'

import { toSvg } from 'jdenticon'

import CSSModules from 'react-css-modules'
import styles from './Avatar.scss'


const Avatar = ({ value, className, size, ownerEthAddress }) => {
  let avatarUrl = `data:image/svg+xml,${encodeURIComponent(toSvg(value, size))}`
  if (ownerEthAddress
    && config
    && config.gravatarUsers
    && config.gravatarUsers[ownerEthAddress]
  ) {
    avatarUrl = `https://www.gravatar.com/avatar/${config.gravatarUsers[ownerEthAddress]}?s=${size}`
  }
  return (
    <Fragment>
      <img
        className={className}
        styleName="avatar"
        alt={value}
        title={value}
        src={avatarUrl}
      />
    </Fragment>
  )
}

Avatar.defaultProps = {
  size: 35,
}

Avatar.propTypes = {
  value: PropTypes.string.isRequired,
  size: PropTypes.number,
  className: PropTypes.string,
  ownerEthAddress: PropTypes.string,
}

export default CSSModules(Avatar, styles)
