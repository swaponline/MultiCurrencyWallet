import React, { Component, Fragment } from 'react'
import styles from './CurrencyButton.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import cx from 'classnames'
import { connect } from 'redaction'


@CSSModules(styles, { allowMultiple: true })
export default class CurrencyButton extends Component<any, any> {

  render() {
    const {
      onClick,
      children,
      disable,
      dataTooltip,
      id,
      text,
      currency,
      deposit,
      wallet,
      isActive,
      ...rest
    } = this.props

    const styleName = cx('button', {
      'disable': disable,
      'wallet': wallet,
    })

    return (
      <Fragment>
        <button styleName={styleName} onClick={!disable ? onClick : () => { }} data-tip data-for={dataTooltip.id} {...rest}>
          {children}
        </button>
        {
          dataTooltip.deposit && (
            <ReactTooltip id={dataTooltip.id} type="light" effect="solid">
              <FormattedMessage id="CurrencyButton41" defaultMessage="Deposit this cryptocurrency to your wallet" />
            </ReactTooltip>
          )
        }

        {
          dataTooltip.isActive && (
            <ReactTooltip id={dataTooltip.id} type="light" effect="solid">
              <FormattedMessage id="CurrencyButton42" defaultMessage="You can not send this asset, because you have a zero balance." />
            </ReactTooltip>
          )
        }
      </Fragment>
    )
  }
}
