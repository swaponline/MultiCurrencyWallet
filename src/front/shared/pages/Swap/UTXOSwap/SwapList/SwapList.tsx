import React, { Component } from 'react'

import { isMobile } from 'react-device-detect'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SwapList.scss'


import FirstStepDefault from './steps/FirstStep'
import SecondStepDefault from './steps/SecondStep'
import ThirdStepDefault from './steps/ThirdStep'
import FourthStepDefault from './steps/FourthStep'

import FirstStepTakerMaker from './TakerMakerSteps/FirstStep'
import SecondStepTakerMaker from './TakerMakerSteps/SecondStep'
import ThirdStepTakerMaker from './TakerMakerSteps/ThirdStep'
import FourthStepTakerMaker from './TakerMakerSteps/FourthStep'


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

    const isTaker = flowClass.isTaker()
    const FirstStep = (isTakerMakerModel && isTaker) ? FirstStepTakerMaker : FirstStepDefault
    const SecondStep = (isTakerMakerModel && isTaker) ? SecondStepTakerMaker : SecondStepDefault
    const ThirdStep = (isTakerMakerModel && isTaker) ? ThirdStepTakerMaker : ThirdStepDefault
    const FourthStep = (isTakerMakerModel && isTaker) ? FourthStepTakerMaker : FourthStepDefault

    console.log('>>>> isTaker render side', (isTakerMakerModel && isTaker))
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
