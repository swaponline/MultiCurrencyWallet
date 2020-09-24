import React, { Component } from 'react'
import Swap from 'swap.swap'

import BtcToEth from './BtcToEth'
import EthToBtc from './EthToBtc'
import EthTokenToBtc from './EthTokenToBtc'
import BtcToEthToken from './BtcToEthToken'

import app from '../../swapApp'

const swapComponents = {
  'BTC2ETH': BtcToEth,
  'ETH2BTC': EthToBtc,
  'NOXON2BTC': EthTokenToBtc,
  'BTC2NOXON': BtcToEthToken,
  'FOO2BTC': EthTokenToBtc,
  'BTC2FOO': BtcToEthToken,
}

export default class SwapComponent extends Component {

  render() {
    const { orderId } = this.props

    if (!orderId) {
      return null
    }

    const swap = new Swap(orderId, app)
    const SwapComponent = swapComponents[swap.flow._flowName.toUpperCase()]

    return (
      <div style={{ paddingLeft: '30px', paddingBottom: '100px' }}>
        <SwapComponent swap={swap} />
      </div>
    )
  }
}
