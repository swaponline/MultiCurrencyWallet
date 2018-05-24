import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './Button.scss'


const Button = (props) => {
  const {
    children, className,
    fullWidth, brand, gray, disabled,
    onClick,
  } = props

  const styleName = cx('button', {
    'fullWidth': fullWidth,
    'brand': brand,
    'gray': gray,
    'disabled': disabled,
  })

  return (
    <div
      styleName={styleName}
      className={className}
      role="button"
      onClick={onClick}
    >
      {children}
    </div>
  )
}

Button.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  brand: PropTypes.bool,
  gray: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
}

export default cssModules(Button, styles, { allowMultiple: true })
