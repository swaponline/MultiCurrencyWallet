import React, { PureComponent } from 'react'

import { swapApp } from 'instances/swap'

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

  render() {
    const { swap } = this.state

    if (!swap) {
      return null
    }

    console.log('Swap data:', swap)

    const { isMy: isMyOrder, buyCurrency, sellCurrency } = swap

    console.log('isMyOrder', isMyOrder)
    console.log('buyCurrency', buyCurrency)
    console.log('sellCurrency', sellCurrency)

    const SwapComponent = swapComponents[`${sellCurrency.toLowerCase()}${buyCurrency.toLowerCase()}`]


    return (
      <div style={{ paddingLeft: '30px' }}>
        <SwapComponent swap={swap} />
      </div>
    )
  }
}
