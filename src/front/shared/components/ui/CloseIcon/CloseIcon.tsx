import React from 'react'
import cssModules from 'react-css-modules'
import styles from './CloseIcon.scss'

type ComponentProps = {
  onClick: (...args: any) => void
  styleName: string
}

const CloseIcon = (props: ComponentProps) => {
  const { onClick, styleName: externalName, ...rest } = props

  return (
    <div styleName="button" {...rest} role="closeButton" onClick={onClick}>
      <div styleName="icon" role="closeIcon" />
    </div>
  )
}

export default cssModules(CloseIcon, styles, { allowMultiple: true })
