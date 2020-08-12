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
    const second = sellCurrency === 'GHOST' ? stepNumbers[`submit-secret`] : stepNumbers[`wait-lock-ghost`]
    const fourth = sellCurrency === 'GHOST' ? stepNumbers[`lock-ghost`] : stepNumbers[`sync-balance`]
    const fifth = sellCurrency === 'GHOST' ? stepNumbers[`wait-lock-eth`] : stepNumbers[`lock-eth`]
    const sixth = sellCurrency === 'GHOST' ? stepNumbers[`withdraw-eth`] : stepNumbers[`wait-withdraw-eth`]
    const seventh = sellCurrency === 'GHOST' ? stepNumbers.finish : stepNumbers[`withdraw-ghost`]
    const eighth = sellCurrency === 'GHOST' ? stepNumbers.end : stepNumbers.finish

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
    const { ethSwapCreationTransactionHash, ghostScriptCreatingTransactionHash } = swap.flow.state

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
