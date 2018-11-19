import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import config from 'app-config'
import cx from 'classnames'

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
    currency,
    deposit,
    rest,
  } = props

  const styleName = cx('withdrawButton', {
    'disable': disable
  })

  return (
    <Fragment>
      <button onClick={!disable ? onClick : () => {}} styleName={styleName} data-tip data-for={currency} {...rest}>
        {children}
      </button>
      {
        disable && (
        <ReactTooltip id={`${currency}`} type="light" effect="solid">
          <FormattedMessage id="WithdrawButton32" defaultMessage="You can not send and exchange this asset, because you have a zero balance." />
        </ReactTooltip>
        )
      }
    </Fragment>
  )

  WithdrawButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool
  }
}
export default CSSModules(WithdrawButton, styles, { allowMultiple: true })
