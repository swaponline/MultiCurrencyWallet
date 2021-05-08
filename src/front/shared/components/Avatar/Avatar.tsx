import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import config from 'helpers/externalConfig'

import { toSvg } from 'jdenticon'

import CSSModules from 'react-css-modules'
import styles from './Avatar.scss'

const hasGravatar = (ethAddress) => {
  if (config && config.gravatarUsers) {
    let has = false
    Object.keys(config.gravatarUsers).forEach((key) => {
      if (key.toLowerCase() === ethAddress.toLowerCase()) {
        has = config.gravatarUsers[key]
        return false
      }
    })
    return has
  }
  return false
}

const Avatar = ({ value, className, size, ownerEthAddress }) => {
  let avatarUrl = `data:image/svg+xml,${encodeURIComponent(toSvg(value, size))}`
  if (ownerEthAddress) {
    const gravatar = hasGravatar(ownerEthAddress)
    if (gravatar) {
      avatarUrl = `https://www.gravatar.com/avatar/${gravatar}?s=${size}`
    }
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
