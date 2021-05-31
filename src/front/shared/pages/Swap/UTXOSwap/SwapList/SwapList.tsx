import React, { Component, Fragment } from 'react'

import { isMobile } from 'react-device-detect'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SwapList.scss'

import DepositWindow from '../DepositWindow/DepositWindow'

import UTXOFirstStep from './UTXOSteps/FirstStep'
import UTXOSecondStep from './UTXOSteps/SecondStep'
import UTXOThirdStep from './UTXOSteps/ThirdStep'
import UTXOFourthStep from './UTXOSteps/FourthStep'

import ABFirstStep from './ABSteps/FirstStep'
import ABSecondStep from './ABSteps/SecondStep'
import ABThirdStep from './ABSteps/ThirdStep'
import ABFourthStep from './ABSteps/FourthStep'


import MakerUtxoToAbtTexts from './SwapProgressTexts/MakerUtxoToAb'
import TakerUtxoToAbTexts from './SwapProgressTexts/TakerUtxoToAb'
import MakerAbToUtxoTexts from './SwapProgressTexts/MakerAbToUtxo'
import TakerAbToUtxoTexts from './SwapProgressTexts/TakerAbToUtxo'


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

    console.group('SwapList >%c constructor', 'color: green;')
    console.log('fields: ', this._fields)
    console.groupEnd()
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
      fields,
      currencyData,
      tokenItems
    } = this.props
    const { first, second, fourth, fifth, sixth, seventh, eighth } = this.state

    const { currencyName } = fields

    const isUTXOSide = flowClass.isUTXOSide

    const FirstStep = (isUTXOSide) ? UTXOFirstStep : ABFirstStep
    const SecondStep = (isUTXOSide) ? UTXOSecondStep : ABSecondStep
    const ThirdStep = (isUTXOSide) ? UTXOThirdStep : ABThirdStep
    const FourthStep = (isUTXOSide) ? UTXOFourthStep : ABFourthStep

    const UtxoToAbTexts = (flow.isTaker()) ? TakerUtxoToAbTexts : MakerUtxoToAbtTexts
    const EthToBtcLike = (flow.isTaker()) ? TakerAbToUtxoTexts : MakerAbToUtxoTexts

    const swapTexts = (
      <Fragment>
        {
          ['BtcLikeToEth', 'BtcLikeToEthToken'].includes(this.props.swapName) &&
            <UtxoToAbTexts step={flow.step} flow={flow} swap={swap} coinName={currencyName} />
        }
        {
          ['EthToBtcLike', 'EthTokenToBtcLike'].includes(this.props.swapName) &&
            <EthToBtcLike step={flow.step} flow={flow} swap={swap} coinName={currencyName} />
        }
      </Fragment>
    )

    const showDepositWindow =
      (!enoughBalance) &&
        (
          (this.props.swapName === 'BtcLikeToEth' || this.props.swapName === 'BtcLikeToEthToken' && flow.step === 3)
          ||
          (this.props.swapName === 'EthToBtcLike' || this.props.swapName === 'EthTokenToBtcLike' && flow.step === 4)
        )

    return (
      <div styleName={`${isMobile ? 'stepList isMobile' : 'stepList'} ${isDark ? 'dark' : ''}`}>
        {!isMobile && <FirstStep step={flow.step} first={first} second={second} fields={this._fields} text={swapTexts} />}
        <SecondStep step={flow.step} swap={swap} second={second} windowWidth={windowWidth} fifth={fifth} fourth={fourth} sixth={sixth} fields={this._fields} text={swapTexts} enoughBalance={enoughBalance} />
        {
          showDepositWindow &&
            <div styleName="swapDepositWindow">
              <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} fields={this._fields} />
            </div>
        }
        <ThirdStep step={flow.step} windowWidth={windowWidth} swap={swap} sixth={sixth} seventh={seventh} eighth={eighth} fields={this._fields} text={swapTexts} />
        {!isMobile && <FourthStep step={flow.step} swap={swap} seventh={seventh} eighth={eighth} fields={this._fields} text={swapTexts} />}
      </div>
    )
  }
}
