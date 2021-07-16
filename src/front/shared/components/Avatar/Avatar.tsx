import React, { Fragment } from 'react'
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

type ComponentProps = {
  value: string
  size?: number
  className?: string
  ownerEthAddress?: string
}

const Avatar = (props: ComponentProps) => {
  const { value, className, size = 35, ownerEthAddress } = props
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

export default CSSModules(Avatar, styles)
