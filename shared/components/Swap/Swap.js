import React, { PureComponent } from 'react'

import SwapApp from 'swap.app/swap.app'

import BtcToEth from './BtcToEth'
import EthToBtc from './EthToBtc'
import EthTokenToBtc from './EthTokenToBtc'
import BtcToEthToken from './BtcToEthToken'


const swapComponents = {
  'btceth': BtcToEth,
  'ethbtc': EthToBtc,
  'noxonbtc': EthTokenToBtc,
  'btcnoxon': BtcToEthToken,
}


export default class Swap extends PureComponent {

  render() {
    const { orderId } = this.props

    if (!orderId) {
      return null
    }

    const { isMy: isMyOrder, buyCurrency, sellCurrency } = SwapApp.services.orders.getByKey(orderId)

    const firstPart     = isMyOrder ? sellCurrency : buyCurrency
    const lastPart      = isMyOrder ? buyCurrency : sellCurrency
    const SwapComponent = swapComponents[`${firstPart.toLowerCase()}${lastPart.toLowerCase()}`]


    return (
      <div style={{ paddingLeft: '30px' }}>
        <SwapComponent orderId={orderId} />
      </div>
    )
  }
}
