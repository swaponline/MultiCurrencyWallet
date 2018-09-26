import React, { PureComponent } from 'react'

import Swap from 'swap.swap'

import { connect } from 'redaction'
import { links } from 'helpers'

import { swapComponents } from './swaps'
import EmergencySave from './EmergencySave/EmergencySave'


@connect({
  errors: 'api.errors',
  checked: 'api.checked',
})
export default class SwapComponent extends PureComponent {

  state = {
    swap: null,
    SwapComponent: null,
  }

  componentWillMount() {
    let { match : { params : { orderId } }, history } = this.props

    if (!orderId) {
      history.push(links.exchange)
      return
    }

    const swap = new Swap(orderId)
    const SwapComponent = swapComponents[swap.flow._flowName]

    this.setState({
      SwapComponent,
      swap,
    })

    this.setSaveSwapId(orderId)

    // for debug and emergency save
    window.swap = swap
  }

  // componentWillMount() {
  //   actions.api.checkServers()
  //     .then(() => {
  //
  //     })
  // }

  setSaveSwapId = (orderId) => {
    let swapsId = JSON.parse(localStorage.getItem('swapId'))

    if (swapsId === null || swapsId.length === 0) {
      swapsId = []
      swapsId.push(orderId)
    }

    const boolean = swapsId.map(item => item === orderId)

    if (!Boolean(...boolean)) {
      swapsId.push(orderId)
    }

    localStorage.setItem('swapId', JSON.stringify(swapsId))
  }

  render() {
    const { swap, SwapComponent } = this.state

    if (!swap || !SwapComponent) {
      return null
    }

    return (
      <div style={{ paddingLeft: '30px', paddingTop: '30px' }}>
        <SwapComponent swap={swap} >
          <EmergencySave flow={swap.flow} />
        </SwapComponent>
      </div>
    )
  }
}
