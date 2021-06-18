import React from 'react'
import cx from 'classnames'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './CloseIcon.scss'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type ComponentProps = {
  onClick: (...args: any) => void
  styleName: string
}

const CloseIcon = (props: ComponentProps) => {
  const { onClick, styleName: externalName, ...rest } = props

  const styleName = cx('button', {
    'dark': isDark,
  })

  return (
    <div styleName={styleName} {...rest} role="closeButton" onClick={onClick}>
      <div styleName="icon" role="closeIcon" />
    </div>
  )
}

export default cssModules(CloseIcon, styles, { allowMultiple: true })
