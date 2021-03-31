import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './styles.scss'

import { FormattedMessage } from 'react-intl'
import QrReader from 'react-qr-scanner'

const defaultDeviceIdChooser = (filteredDevices, videoDevices) => {
  alert('defaultDeviceIdChooser')
  alert('Filtered:'+ filteredDevices.length)
  alert('Count:'+ videoDevices.length)
  videoDevices.forEach((device) => {
    alert('Device label: '+ device.label)
  })
  return (filteredDevices.length > 0)
    ? filteredDevices[0].deviceId
    // No device found with the pattern thus use another video device
    : videoDevices[0].deviceId
}

/* eslint-disable */
const QR = ({ openScan, handleScan, handleError }) => (
  <div styleName="scan">
    <span styleName="close" onClick={openScan}>
      &times;
    </span>
    <QrReader
      delay={10}
      facingMode="front"
      onError={handleError}
      onScan={handleScan}
      chooseDeviceId={defaultDeviceIdChooser}
      style={{ width: '100%' }}
    />
  </div>
)

/* eslint-enable */

export default CSSModules(QR, styles, { allowMultiple: true })
