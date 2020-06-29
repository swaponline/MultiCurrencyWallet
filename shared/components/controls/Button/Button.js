import React from "react";
import PropTypes from "prop-types";
import { constants } from 'helpers'
import cx from "classnames";



const isDark = localStorage.getItem(constants.localStorage.isDark)
const Button = props => {
  const {
    children,
    className,
    fullWidth,
    brand,
    transparent,
    blue,
    green,
    white,
    gray,
    disabled,
    big,
    autoHeight,
    onClick,
    id = '',
    fill,
    dataTut,
  } = props

  const styleName = cx('button', {
    fill,
    fullWidth,
    brand,
    transparent,
    green,
    blue,
    white,
    gray,
    big,
    autoHeight,
    disabled,
    "darkTheme-white": isDark && white,
    "darkTheme-gray": isDark && gray,
  })

  return (
    <button
      data-tut={dataTut}
      styleName={styleName}
      className={className}
      onClick={onClick}
      id={id}
      disabled={disabled}
      data-tip
      data-for={id}
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
  blue: PropTypes.bool,
  gray: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
}

export default cssModules(Button, styles, { allowMultiple: true })
