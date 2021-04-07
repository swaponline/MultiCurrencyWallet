import React from 'react'
import cssModules from 'react-css-modules'
import styles from './WidthContainer.scss'

type WidthContainerProps = {
  children: JSX.Element[] | JSX.Element
  className: string
}

const WidthContainer = (props: WidthContainerProps) => {
  const { children, className } = props

  return (
    <div styleName="widthContainer" className={className}>
      {children}
    </div>
  )
}

export default cssModules(WidthContainer, styles, { allowMultiple: true })
