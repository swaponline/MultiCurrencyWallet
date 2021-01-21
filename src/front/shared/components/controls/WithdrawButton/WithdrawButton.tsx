import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'


const WithdrawButton = (props) => {
  const {
    onClick,
    children,
    disable,
    ...rest
  } = props

  const styleName = cx('withdrawButton', {
    'disable': disable,
  })

  return (
    <button onClick={!disable ? onClick : () => {}} styleName={styleName} {...rest}>
      {children}
    </button>
  )
}

WithdrawButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
}

export default CSSModules(WithdrawButton, styles, { allowMultiple: true })
