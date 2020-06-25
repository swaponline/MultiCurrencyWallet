import React, { Component } from 'react'

import { isMobile } from 'react-device-detect'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SwapList.scss'


import FirstStep from './steps/FirstStep'
import SecondStep from './steps/SecondStep'
import ThirdStep from './steps/ThirdStep'
import FourthStep from './steps/FourthStep'


const isDark = localStorage.getItem(constants.localStorage.isDark)
@CSSModules(styles, { allowMultiple: true })
export default class SwapList extends Component {

  constructor({ swap: { sellCurrency, flow: { stepNumbers } } }) {
    super()

    const first = stepNumbers.sign
    const second = sellCurrency === 'BTC' ? stepNumbers[`submit-secret`] : stepNumbers[`wait-lock-btc`]
    const fourth = sellCurrency === 'BTC' ? stepNumbers[`lock-btc`] : stepNumbers[`sync-balance`]
    const fifth = sellCurrency === 'BTC' ? stepNumbers[`wait-lock-eth`] : stepNumbers[`lock-eth`]
    const sixth = sellCurrency === 'BTC' ? stepNumbers[`withdraw-eth`] : stepNumbers[`wait-withdraw-eth`]
    const seventh = sellCurrency === 'BTC' ? stepNumbers.finish : stepNumbers[`withdraw-btc`]
    const eighth = sellCurrency === 'BTC' ? stepNumbers.end : stepNumbers.finish

    this.state = {
      first,
      second,
      fourth,
      fifth,
      sixth,
      seventh,
      eighth,
    }
  }
  render() {
    const { swap, flow, enoughBalance, windowWidth } = this.props
    const { first, second, fourth, fifth, sixth, seventh, eighth } = this.state
    const { ethSwapCreationTransactionHash, btcScriptCreatingTransactionHash } = swap.flow.state

    return (
      <div styleName={`${isMobile ? 'stepList isMobile' : 'stepList'} ${isDark ? 'dark' : ''}`}>
        {!isMobile && <FirstStep step={flow.step} first={first} second={second} />}
        <SecondStep step={flow.step} swap={swap} second={second} windowWidth={windowWidth} fifth={fifth} fourth={fourth} sixth={sixth} />
        <ThirdStep step={flow.step} windowWidth={windowWidth} swap={swap} sixth={sixth} seventh={seventh} eighth={eighth} />
        {!isMobile && <FourthStep step={flow.step} swap={swap} seventh={seventh} eighth={eighth} />}
      </div>
    )
  }
}
