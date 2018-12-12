import React, { Component, Fragment } from 'react'
import styles from './CurrencyButton.scss'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import cx from 'classnames'
import { connect } from 'redaction'


@CSSModules(styles, { allowMultiple: true })
export default class CurrencyButton extends Component {

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
        <button styleName={styleName} onClick={!disable ? onClick : () => {}} data-tip data-for={dataTooltip.id} {...rest}>
          {children}
        </button>
        {
          dataTooltip.isActive && (
            <ReactTooltip id={dataTooltip.id} type="light" effect="solid">
              <FormattedMessage id={dataTooltip.id} defaultMessage={dataTooltip.text} />
            </ReactTooltip>
          )
        }
      </Fragment>
    )
  }
}
