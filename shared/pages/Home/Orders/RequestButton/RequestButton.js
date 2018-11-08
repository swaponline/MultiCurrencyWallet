import React from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'
import PAIR_TYPES from 'helpers/constants/PAIR_TYPES'


const RequestButton = ({ disabled, children, data: { type, base, amount, total, main }, move, ...rest  }) =>  (
  <button styleName={!disabled ? 'button disabled' : 'button'} {...rest}>
    {
      move ? (
        <React.Fragment>
          {type === PAIR_TYPES.BID ? 'SELL' : 'BUY'}
          {' '}
          {amount.toFixed(4)}{' '}{main}
          <br />
          FOR
          {' '}
          {total.toFixed(4)}{' '}{base}
        </React.Fragment>
      ) : (
        children
      )
    }
  </button>
)

export default cssModules(RequestButton, styles, { allowMultiple: true })
