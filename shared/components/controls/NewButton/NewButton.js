import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './NewButton.scss'


const NewButton = (props) => {
  const {
    children, className,
    fullWidth, brand, transparent, blue, green, white, gray, disabled,
    onClick, id = '', dataTut,
  } = props

  const styleName = cx('button', {
    'fullWidth': fullWidth,
    'brand': brand,
    'transparent': transparent,
    'green': green,
    'blue': blue,
    'white': white,
    'gray': gray,
    'disabled': disabled,
  })

  return (
    <button
      data-tut={dataTut}
      styleName={styleName}
      className={className}
      onClick={onClick}
      id={id}
      disabled={disabled}
      data-tip data-for={id}
    >
      {children}
    </button>
  )
}

NewButton.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  brand: PropTypes.bool,
  green: PropTypes.bool,
  white: PropTypes.bool,
  blue: PropTypes.bool,
  gray: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
}

export default cssModules(NewButton, styles, { allowMultiple: true })
