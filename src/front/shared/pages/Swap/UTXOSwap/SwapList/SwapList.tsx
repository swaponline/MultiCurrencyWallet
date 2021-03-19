import React, { Component } from 'react'

import { isMobile } from 'react-device-detect'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SwapList.scss'


import UTXOFirstStep from './UTXOSteps/FirstStep'
import UTXOSecondStep from './UTXOSteps/SecondStep'
import UTXOThirdStep from './UTXOSteps/ThirdStep'
import UTXOFourthStep from './UTXOSteps/FourthStep'

import ABFirstStep from './ABSteps/FirstStep'
import ABSecondStep from './ABSteps/SecondStep'
import ABThirdStep from './ABSteps/ThirdStep'
import ABFourthStep from './ABSteps/FourthStep'


const isDark = localStorage.getItem(constants.localStorage.isDark)
@CSSModules(styles, { allowMultiple: true })
export default class SwapList extends Component<any, any> {

  _fields = null

  constructor(props) {
    super(props)
    const {
      swap: {
        sellCurrency,
        flow: {
          stepNumbers,
          isTakerMakerModel,
        },
        flow,
      },
      fields,
    } = props

    const isTaker = flow.isTaker()

    this._fields = fields

    console.log('swaplist fields', fields, this._fields)
    const { currencyName } = fields

    const first = stepNumbers.sign
    const second = sellCurrency === currencyName ? stepNumbers[`submit-secret`] : stepNumbers[`wait-lock-utxo`]
    const fourth = sellCurrency === currencyName ? stepNumbers[`lock-utxo`] : stepNumbers[`sync-balance`]
    const fifth = sellCurrency === currencyName ? stepNumbers[`wait-lock-eth`] : stepNumbers[`lock-eth`]
    const sixth = sellCurrency === currencyName ? stepNumbers[`withdraw-eth`] : stepNumbers[`wait-withdraw-eth`]
    const seventh = sellCurrency === currencyName ? stepNumbers.finish : stepNumbers[`withdraw-utxo`]
    const eighth = sellCurrency === currencyName ? stepNumbers.end : stepNumbers.finish

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
    const {
      swap: {
        flow: {
          isTakerMakerModel,
        },
        flow: flowClass,
      },
      flow,
      swap,
      enoughBalance,
      windowWidth,
    } = this.props
    const { first, second, fourth, fifth, sixth, seventh, eighth } = this.state

    const isUTXOSide = flowClass.isUTXOSide
    const FirstStep = (isUTXOSide) ? UTXOFirstStep : ABFirstStep
    const SecondStep = (isUTXOSide) ? UTXOSecondStep : ABSecondStep
    const ThirdStep = (isUTXOSide) ? UTXOThirdStep : ABThirdStep
    const FourthStep = (isUTXOSide) ? UTXOFourthStep : ABFourthStep

    return (
      <div styleName={`${isMobile ? 'stepList isMobile' : 'stepList'} ${isDark ? 'dark' : ''}`}>
        {!isMobile && <FirstStep step={flow.step} first={first} second={second} fields={this._fields} />}
        <SecondStep step={flow.step} swap={swap} second={second} windowWidth={windowWidth} fifth={fifth} fourth={fourth} sixth={sixth} fields={this._fields} />
        <ThirdStep step={flow.step} windowWidth={windowWidth} swap={swap} sixth={sixth} seventh={seventh} eighth={eighth} fields={this._fields}  />
        {!isMobile && <FourthStep step={flow.step} swap={swap} seventh={seventh} eighth={eighth} fields={this._fields}  />}
      </div>
    )
  }
}
