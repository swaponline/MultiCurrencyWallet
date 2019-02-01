import React from 'react'

import styles from './NotFound.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


const NotFound = () => (
  <div className="container">
    <h2 styleName="text">
      <FormattedMessage id="NotFound8" defaultMessage="Page not found!" />
    </h2>
  </div>
)
export default CSSModules(NotFound, styles)
