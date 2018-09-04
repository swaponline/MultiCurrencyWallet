import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './Button.scss'


const Button = (props) => {
  const {
    children, className,
    fullWidth, brand, green, white, gray, disabled,
    onClick, id = '',
  } = props

  const styleName = cx('button', {
    'fullWidth': fullWidth,
    'brand': brand,
    'green': green,
    'white': white,
    'gray': gray,
    'disabled': disabled,
  })

  return (
    <button
      styleName={styleName}
      className={className}
      onClick={onClick}
      id={id}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  brand: PropTypes.bool,
  green: PropTypes.bool,
  white: PropTypes.bool,
  gray: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
}

export default cssModules(Button, styles, { allowMultiple: true })
