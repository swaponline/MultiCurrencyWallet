import React from 'react'

import cssModules from 'react-css-modules'
import styles from './RequestButton.scss'


const RequestButton = ({ disabled, children, data: { base, amount, total, main }, move, ...rest  }) =>  (
  <button styleName={!disabled ? 'button disabled' : 'button'} disabled={!disabled} {...rest}>
    {
      move ? (
        <React.Fragment>
          Exchange {amount.toFixed(4)}{' '}{main}
          <br />
          to {total.toFixed(4)}{' '}{base}
        </React.Fragment>
      ) : (
        children
      )
    }
  </button>
)

export default cssModules(RequestButton, styles, { allowMultiple: true })
