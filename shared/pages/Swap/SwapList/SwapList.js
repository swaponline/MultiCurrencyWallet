import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { links } from 'helpers'
import { isMobile } from 'react-device-detect'

import CSSModules from 'react-css-modules'
import styles from './SwapList.scss'

import { FormattedMessage } from 'react-intl'

import FirstStep from './steps/FirstStep'
import SecondStep from './steps/SecondStep'
import ThirdStep from './steps/ThirdStep'
import FourthStep from './steps/FourthStep'

@CSSModules(styles, { allowMultiple: true })
export default class SwapList extends Component {

  constructor({ swap: { sellCurrency, flow: { stepNumbers } } }) {
    super()
    console.warn("stepNumbers")
    const first = stepNumbers.sign
    const second = sellCurrency === 'BTC' ? stepNumbers[`submit-secret`] : stepNumbers[`wait-lock-btc`]
    const fourth = sellCurrency === 'BTC' ? stepNumbers[`lock-btc`] : stepNumbers[`sync-balance`]
    const fifth = sellCurrency === 'BTC' ? stepNumbers[`wait-lock-${sellCurrency.toLowerCase()}`] : stepNumbers[`lock-${sellCurrency.toLowerCase()}`]
    const sixth = sellCurrency === 'BTC' ? stepNumbers[`withdraw-${sellCurrency.toLowerCase()}`] : stepNumbers[`wait-withdraw-${sellCurrency.toLowerCase()}`]
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
      <div styleName={isMobile ? 'stepList isMobile' : 'stepList'}>
        {!isMobile && <FirstStep step={flow.step} first={first} second={second} />}
        <SecondStep step={flow.step} swap={swap} second={second} windowWidth={windowWidth} fifth={fifth} fourth={fourth} sixth={sixth} />
        <ThirdStep step={flow.step} windowWidth={windowWidth} swap={swap} sixth={sixth} seventh={seventh} eighth={eighth} />
        {!isMobile && <FourthStep step={flow.step} swap={swap} seventh={seventh} eighth={eighth} />}
      </div>
    )
  }
}
