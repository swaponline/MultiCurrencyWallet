import React, { Component } from 'react'
import { swapApp } from 'instances/swap'

import BtcToEth from './BtcToEth'
import EthToBtc from './EthToBtc'
import EthTokenToBtc from './EthTokenToBtc'
import BtcToEthToken from './BtcToEthToken'


const swapComponents = {
  'btceth': BtcToEth,
  'ethbtc': EthToBtc,
  'ethtokenbtc': EthTokenToBtc,
  'btcethtoken': BtcToEthToken,
}

export default class Swap extends Component {

  state = {
    swap: null // app.createSwap({ orderId: 'QmZ1aTi5Jod3iuPB8SwPSLuWUs6TJV5upmzH1h9YnzqpSQ-1525181053520' }),
  }

  componentWillReceiveProps({ orderId }) {
    const { swap } = this.state

    if (!swap && orderId) {
      const swap = swapApp.createSwap({ orderId })

      this.setState({
        swap,
      })
    }
  }

  render() {
    const { swap } = this.state

    if (!swap) {
      return null
    }

    console.log('Swap data:', swap)

    const { isMy: isMyOrder, buyCurrency, sellCurrency } = swap
    // TODO dynamically resolve Swap component to use
    const firstPart     = isMyOrder ? sellCurrency : buyCurrency
    const lastPart      = isMyOrder ? buyCurrency : sellCurrency
    const SwapComponent = swapComponents[`${firstPart.toLowerCase()}${lastPart.toLowerCase()}`]

    return (
      <div style={{ paddingLeft: '30px' }}>
        <SwapComponent swap={swap} />
      </div>
    )
  }
}
