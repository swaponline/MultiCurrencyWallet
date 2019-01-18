import React, { Fragment } from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'
import { isMobile } from 'react-device-detect'

import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'

import { FormattedMessage } from 'react-intl'


const RequestButton = ({ disabled, children, data: { type, base, amount, total, main }, move, ...rest  }) =>  (
  <button styleName={!disabled ? 'button disabled' : 'button'} {...rest}>
    {
      move ? (
        <Fragment>
          {type === PAIR_TYPES.BID ?
            <FormattedMessage id="Reqstbttn15" defaultMessage="SELL" />
            :
            <FormattedMessage id="Reqstbttn16" defaultMessage="BUY" />
          }
          {' '}
          {amount.toFixed(5)}{' '}{main}
          <br />
          <FormattedMessage id="Reqstbttn22" defaultMessage="FOR" />
          {' '}
          {total.toFixed(5)}{' '}{base}
        </Fragment>
      ) : (
        children
      )
    }
  </button>
)

export default cssModules(RequestButton, styles, { allowMultiple: true })
