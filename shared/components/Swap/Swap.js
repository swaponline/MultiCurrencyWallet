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
    swap: null,
  }

  componentWillMount() {
    const { swap } = this.state
    const { orderId } = this.props

    console.log('componentWillMount', orderId)

    if (!swap && orderId) {
      const swap = swapApp.createSwap({ orderId })

      this.setState({
        swap,
      })
    }
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    const { swap } = this.state

    if (!swap) {
      return null
    }

    console.log('Swap data:', swap)

    const { isMy: isMyOrder, buyCurrency, sellCurrency } = swap

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
