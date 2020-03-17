import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

/**
 * @todo Amount support?
 */
export default class QR extends PureComponent {

  static propTypes = {
    network: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    size: PropTypes.number,
  }

  static defaultProps = {
    size: 250,
  }

  render() {
    let { network, address, size } = this.props

    switch (network.toLowerCase()) {
      case 'btc (multisig)':
      case 'btc (sms-protected)':
        network = 'btc'
        break;
      case 'usdt (multisig)':
        network = 'usdt'
        break
    }

    const addressHasNetwork = /:/.test(address)
    const networkValue = addressHasNetwork ? '' : `${network}:`

    return (
      <img
        src={`https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${networkValue}${address}`}
        alt={`${network}: ${address}`}
      />
    )
  }
}
