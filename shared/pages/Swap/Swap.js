import React, { PureComponent } from 'react'
import Swap from 'swap.swap'

import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'

import BtcToEos from './BtcToEos'
import EosToBtc from './EosToBtc'
import BtcToEth from './BtcToEth'
import EthToBtc from './EthToBtc'
import EthTokenToBtc from './EthTokenToBtc'
import BtcToEthToken from './BtcToEthToken'

const swapComponents = {
  'BTC2EOS': BtcToEos,
  'EOS2BTC': EosToBtc,
  'BTC2ETH': BtcToEth,
  'ETH2BTC': EthToBtc,
  'NOXON2BTC': EthTokenToBtc,
  'BTC2NOXON': BtcToEthToken,
  'SWAP2BTC': EthTokenToBtc,
  'BTC2SWAP': BtcToEthToken,
}

export default class SwapComponent extends PureComponent {

  render() {
    const { match : { params : { orderId } } } = this.props

    if (!orderId) {
      return (
        <div>
          <h3>The order creator is offline. Waiting for him..</h3>
          <InlineLoader />
        </div>
      )
    }

    const swap = new Swap(orderId)
    const SwapComponent = swapComponents[swap.flow._flowName.toUpperCase()]

    return (
      <div style={{ paddingLeft: '30px', paddingTop: '30px' }}>
        {
          swap.id && (
            <strong>{swap.sellAmount.toNumber()} {swap.sellCurrency} &#10230; {swap.buyAmount.toNumber()} {swap.buyCurrency}</strong>
          )
        }

        {
          !swap.id && (
            swap.isMy ? (
              <h3>This order doesn't have a buyer</h3>
            ) : (
              <Fragment>
                <h3>The order creator is offline. Waiting for him..</h3>
                <InlineLoader />
              </Fragment>
            )
          )
        }

        {
          swap.flow.state.isWaitingForOwner && (
            <Fragment>
              <h3>Waiting for other user when he connect to the order</h3>
              <InlineLoader />
            </Fragment>
          )
        }

        <SwapComponent swap={swap} />
      </div>
    )
  }
}
