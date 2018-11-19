import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import config from 'app-config'

import CSSModules from 'react-css-modules'
import styles from './WithdrawButton.scss'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const WithdrawButton = (props) => {
  const {
    onClick,
    children,
    className,
    disable,
    datafor,
    currency,
    deposit,
  } = props

  return (
    <Fragment>
    {
      !disable &&
      (
      <button styleName="withdrawButton" onClick={onClick} className={className} data-tip data-for={datafor} currency={currency}>
        {children}
      </button>
      )
    }
    {
      disable &&
      (
        <button styleName="disable" className={className} data-tip data-for={datafor} onClick={onClick} disable={disable}>
          {children}
        </button>
      )
    }
    <ReactTooltip id={`send${currency}`} type="light" effect="solid">
      <FormattedMessage id="WithdrawButton32" defaultMessage="You can not send this asset, because you have a zero balance." />
    </ReactTooltip>
    <ReactTooltip id={`exchange${currency}`} type="light" effect="solid">
        <FormattedMessage id="WithdrawButton35" defaultMessage="You can not exchange this asset, because you have a zero balance." />
    </ReactTooltip>
   </Fragment>
  )

  WithdrawButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool
  }
}
export default CSSModules(WithdrawButton, styles)
