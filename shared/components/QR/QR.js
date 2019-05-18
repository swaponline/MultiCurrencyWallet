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
    const { network, address, size } = this.props

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
