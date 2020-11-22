import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './styles.scss'

import { FormattedMessage } from 'react-intl'
import QrReader from 'react-qr-scanner'

/* eslint-disable */
const QR = ({ openScan, handleScan, handleError }) => (
  <div styleName="scan">
    <span styleName="close" onClick={openScan}>
      &times;
    </span>
    <QrReader
      delay={10}
      facingMode="rear"
      onError={handleError}
      onScan={handleScan}
      style={{ width: '100%' }}
    />
  </div>
)

/* eslint-enable */

export default CSSModules(QR, styles, { allowMultiple: true })
