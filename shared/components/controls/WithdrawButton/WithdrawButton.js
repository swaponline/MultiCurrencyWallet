import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

 import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'


const WithdrawButton = (props) => {

  const {
    children,
    disabled,
    onClick,
    className,
    dataFor,
    disable,
    type,
    } = props

   const styleName = cx('withdrawButton', {
    'disable': disable,
  })

   return (
    <Fragment>
      <button styleName={styleName} className={className} onClick={onClick} disable={disable}>
        {children}
      </button>
    </Fragment>
    )
}

WithdrawButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool
}

export default CSSModules(WithdrawButton, styles, { allowMultiple: true })
