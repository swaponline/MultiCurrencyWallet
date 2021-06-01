import React, { Component, Fragment } from 'react'

import { isMobile } from 'react-device-detect'
import { constants } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SwapList.scss'

import DepositWindow from '../DepositWindow/DepositWindow'

import FirstStep from './SwapSteps/FirstStep'
import FourthStep from './SwapSteps/FourthStep'

import UTXOSecondStep from './SwapSteps/UTXOSteps/SecondStep'
import UTXOThirdStep from './SwapSteps/UTXOSteps/ThirdStep'

import ABSecondStep from './SwapSteps/ABSteps/SecondStep'
import ABThirdStep from './SwapSteps/ABSteps/ThirdStep'


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

    this._fields = props.fields

    console.group('SwapList >%c constructor', 'color: green;')
    console.log('fields: ', this._fields)
    console.groupEnd()
  }

  getStepName = () => {
    const {
      swap: {
        flow: {
          stepNumbers
        }
      },
      flow: {
        step
      }
     } = this.props

     let stepName = ''

    Object.keys(stepNumbers).forEach((key) => {
      if (stepNumbers[key] === step) {
        stepName = key
      }
    })

    console.log('stepName', stepName)

    return stepName
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

    const { currencyName } = fields

    const isUTXOSide = flowClass.isUTXOSide

    const SecondStep = (isUTXOSide) ? UTXOSecondStep : ABSecondStep
    const ThirdStep = (isUTXOSide) ? UTXOThirdStep : ABThirdStep

    const UtxoToAbTexts = (flow.isTaker) ? TakerUtxoToAbTexts : MakerUtxoToAbtTexts
    const AbToUtxoTexts = (flow.isTaker) ? TakerAbToUtxoTexts : MakerAbToUtxoTexts

    const swapTexts = (
      <Fragment>
        {
          ['BtcLikeToEth', 'BtcLikeToEthToken'].includes(this.props.swapName) &&
            <UtxoToAbTexts flow={flow} swap={swap} stepName={this.getStepName()} />
        }
        {
          ['EthToBtcLike', 'EthTokenToBtcLike'].includes(this.props.swapName) &&
            <AbToUtxoTexts flow={flow} swap={swap} stepName={this.getStepName()} />
        }
      </Fragment>
    )

    const showDepositWindow = !enoughBalance && this.getStepName() === 'sync-balance'

    return (
      <div styleName={`${isMobile ? 'stepList isMobile' : 'stepList'} ${isDark ? 'dark' : ''}`}>
        {!isMobile && <FirstStep stepName={this.getStepName()} text={swapTexts} />}
        <SecondStep stepName={this.getStepName()} swap={swap} fields={this._fields} text={swapTexts} enoughBalance={enoughBalance} />
        {
          showDepositWindow &&
            <div styleName="swapDepositWindow">
              <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} fields={this._fields} />
            </div>
        }
        {/* <ThirdStep step={flow.step} windowWidth={windowWidth} swap={swap} sixth={sixth} seventh={seventh} eighth={eighth} fields={this._fields} text={swapTexts} /> */}
        {!isMobile && <FourthStep stepName={this.getStepName()} text={swapTexts} />}
      </div>
    )
  }
}
