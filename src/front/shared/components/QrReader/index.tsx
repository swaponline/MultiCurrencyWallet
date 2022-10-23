import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './styles.scss'

import { FormattedMessage } from 'react-intl'
import { QrReader } from 'react-qr-reader'

/* eslint-disable */
const QR = ({ openScan, handleScan, handleError }) => (
  <div styleName="scan">
    <span styleName="close" onClick={openScan}>
      &times;
    </span>
    { /* @ts-ignore */ }
    <QrReader
      onResult={(result, error) => {
        if (!!result) {
          handleScan(result?.getText())
          return
        }

        if (!!error) {
          handleError(error)
        }
      }}
    />
  </div>
)

/* eslint-enable */

export default CSSModules(QR, styles, { allowMultiple: true })
