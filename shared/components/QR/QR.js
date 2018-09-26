import React, { Component } from 'react'
import PropTypes from 'prop-types'

/**
 * @todo Amount support?
 */
export default class QR extends Component {
  static propTypes = {
    network: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    size: PropTypes.number,
  }

  render() {
    const { network, address, size = 250 } = this.props

    return (
      <img
        src={`https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${network}:${address}`}
        alt={`${network}: ${address}`}
      />
    )
  }
}
