import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './styles.scss'

import { FormattedMessage } from 'react-intl'
import QrReader from 'react-qr-scanner'


const QR = ({ openScan, handleScan, handleError }) => (
  <div styleName="scan">
    <span styleName="close" onClick={openScan}>
      <FormattedMessage id="closeIcon1241" defaultMessage="+" />
    </span>
    <QrReader
      delay={300}
      onError={handleError}
      onScan={handleScan}
      style={{ width: '100%' }}
    />
  </div>
)

export default CSSModules(QR, styles, { allowMultiple: true })
