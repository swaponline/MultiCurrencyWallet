import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './Flip.scss'

type ComponentProps = {
  onClick: () => void
  className?: string
}

const Flip = (props: ComponentProps) => {
  const { onClick, className = '' } = props

  return (
    <button
      alt="flip currency"
      onClick={onClick}
      className={className}
      styleName="trade-panel__change"
    />
  )
}

export default CSSModules(Flip, styles)
