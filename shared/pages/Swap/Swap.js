import React, { PureComponent } from 'react'
import Swap from 'swap.swap'
import config from 'app-config'

import actions from 'redux/actions'

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

  state = {
    swap: null,
    SwapComponent: null,
    errors: false
  }

  createSwap() {
    const { match : { params : { orderId } } } = this.props

    const swap = new Swap(orderId)
    const SwapComponent = swapComponents[swap.flow._flowName.toUpperCase()]

    this.setState({
      SwapComponent,
      swap,
    })

    this.setSaveSwapId(orderId)

    // for debug and emergency save
    window.swap = swap
  }

  componentWillMount() {
    actions.api.checkServers().then(() => {
      this.createSwap();
    }).catch(e => {
      this.setState({errors: true})
    });
  }

  setSaveSwapId = (orderId) => {
    let swapsId = JSON.parse(localStorage.getItem('swapId'))

    if (swapsId === null || swapsId.length === 0) {
      swapsId = []
      swapsId.push(orderId)
    }

    const boolean = swapsId.map(item => item !== orderId)

    if (Boolean(...boolean)) {
      swapsId.push(orderId)
    }

    localStorage.setItem('swapId', JSON.stringify(swapsId))
  }

  render() {
    const { swap, SwapComponent, errors } = this.state

    return (
      <div style={{ paddingLeft: '30px', paddingTop: '30px' }}>
        {
          swap && <SwapComponent swap={swap} >
            <EmergencySave flow={swap.flow} />
          </SwapComponent>
        }
        {
          errors && <div><h2>Error!</h2>Can't reach payments provider server. Please, try again later</div>
        }
      </div>
    )
  }
}
