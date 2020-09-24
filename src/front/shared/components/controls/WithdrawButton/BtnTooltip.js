import React, { Component, Fragment } from 'react'
import WithdrawButton from './WithdrawButton'
import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'


const BtnTooltip = (props) => {
  const {
    onClick,
    children,
    disable,
    id,
    text,
    ...rest
  } = props

  return (
    <Fragment>
      <WithdrawButton disable={disable} onClick={onClick} data-tip data-for={id} {...rest}>
        {children}
      </WithdrawButton>
      {
        disable && (
          <ReactTooltip id={id} type="light" effect="solid">
            <FormattedMessage id="WithdrawButton322" defaultMessage="You can not send this asset, because you have a zero balance." />
          </ReactTooltip>
        )
      }
    </Fragment>
  )
}

export default BtnTooltip
