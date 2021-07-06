import React from 'react'
import cx from 'classnames'
import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'

type ComponentProps = {
  onClick: () => void
  disable: boolean
  children: JSX.Element | JSX.Element[]
}

const WithdrawButton = (props: ComponentProps) => {
  const {
    onClick,
    children,
    disable,
    ...rest
  } = props

  const doNothing = () => undefined

  const styleName = cx('withdrawButton', {
    'disable': disable,
  })

  return (
    <button onClick={!disable ? onClick : doNothing} styleName={styleName} {...rest}>
      {children}
    </button>
  )
}

export default CSSModules(WithdrawButton, styles, { allowMultiple: true })
