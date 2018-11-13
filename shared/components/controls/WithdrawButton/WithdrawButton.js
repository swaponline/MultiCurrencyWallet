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
    className,
    disabled,
    onClick,
    disable,
    dataFor,
  } = props

  const styleName = cx('withdrawButton', {
    'disabled': disabled,
    'disable': disable,
  })

  return (
    <Fragment>
      <button styleName={styleName} className={className} onClick={onClick} data-tip data-for={dataFor} disable={disable}>
        {children}
      </button>
      <ReactTooltip id="true" type="light" effect="solid" multiline={true}>
        <a>
          You can not send or exchange <br/> this asset, because you <br/> have a zero balance. Please deposit to <br/>  your wallet to exchange this asset
        </a>
      </ReactTooltip>
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
