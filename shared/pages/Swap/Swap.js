import React, { PureComponent } from 'react'
import Swap from 'swap.swap'

import EmergencySave from './EmergencySave/EmergencySave'

import BtcToEth from './BtcToEth'
import EthToBtc from './EthToBtc'
import EthTokenToBtc from './EthTokenToBtc'
import BtcToEthToken from './BtcToEthToken'


const swapComponents = {
  'BTC2ETH': BtcToEth,
  'ETH2BTC': EthToBtc,
  'NOXON2BTC': EthTokenToBtc,
  'BTC2NOXON': BtcToEthToken,
  'SWAP2BTC': EthTokenToBtc,
  'BTC2SWAP': BtcToEthToken,
}

export default class SwapComponent extends PureComponent {

  componentWillMount() {
    const { match : { params : { orderId } } } = this.props
    this.setSaveSwapId(orderId)
  }

  setSaveSwapId = (orderId) => {
    let swapsId = JSON.parse(localStorage.getItem('swapId'))

    if (swapsId === null || swapsId.length === 0) {
      swapsId = []
      swapsId.push(orderId)
    }

    swapsId.map(item => {
      if (item !== orderId) {
        swapsId.push(orderId)
      }
    })

    localStorage.setItem('swapId', JSON.stringify(swapsId))
  }

  render() {
    const { match : { params : { orderId } } } = this.props

    if (!orderId) {
      return null
    }

    const swap = new Swap(orderId)
    const SwapComponent = swapComponents[swap.flow._flowName.toUpperCase()]

    // for debug and emergency save
    window.swap = swap

    return (
      <div style={{ paddingLeft: '30px', paddingTop: '30px' }}>
        <SwapComponent swap={swap} />
        <EmergencySave flow={swap.flow} />
      </div>
    )
  }
}
