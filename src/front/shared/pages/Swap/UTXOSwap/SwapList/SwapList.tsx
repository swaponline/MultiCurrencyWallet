import React, { Fragment } from 'react'

import { isMobile } from 'react-device-detect'

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

import SWAP_STEPS from 'common/helpers/constants/SWAP_STEPS'

const {
  FIRST_STEP,
  TAKER_UTXO_SECOND_STEPS,
  MAKER_UTXO_SECOND_STEPS,
  TAKER_EVM_SECOND_STEPS,
  MAKER_EVM_SECOND_STEPS,
  TAKER_UTXO_THIRD_STEPS,
  MAKER_UTXO_THIRD_STEPS,
  TAKER_EVM_THIRD_STEPS,
  MAKER_EVM_THIRD_STEPS,
  FOURTH_STEP
} = SWAP_STEPS


@CSSModules(styles, { allowMultiple: true })
export default class SwapList extends React.PureComponent<any, any> {

  _fields = null

  constructor(props) {
    super(props)

    this.state = {
      stepName: this.getStepName()
    }

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

  componentDidUpdate(prevProps) {
    const { flow: { step: prevStep } } = prevProps
    const { flow: { step } } = this.props

    if(prevStep !== step) {
      this.setState({
        stepName: this.getStepName()
      })
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
      currencyData,
      tokenItems
    } = this.props

    const { stepName } = this.state

    const isUTXOSide = flowClass.isUTXOSide

    const SecondStep = (isUTXOSide) ? UTXOSecondStep : ABSecondStep
    const ThirdStep = (isUTXOSide) ? UTXOThirdStep : ABThirdStep

    const secondActiveStep = isUTXOSide ?
      flow.isTaker ? TAKER_UTXO_SECOND_STEPS : MAKER_UTXO_SECOND_STEPS
      :
      flow.isTaker ? TAKER_EVM_SECOND_STEPS : MAKER_EVM_SECOND_STEPS

    const thirdActiveStep = isUTXOSide ?
      flow.isTaker ? TAKER_UTXO_THIRD_STEPS : MAKER_UTXO_THIRD_STEPS
      :
      flow.isTaker ? TAKER_EVM_THIRD_STEPS : MAKER_EVM_THIRD_STEPS

    const isFirstStepActive = (FIRST_STEP.includes(stepName))
    const isSecondStepActive = (secondActiveStep.includes(stepName))
    const isThirdStepActive = (thirdActiveStep.includes(stepName))
    const isFourthStepActive = (FOURTH_STEP.includes(stepName))

    const UtxoToAbTexts = (flow.isTaker) ? TakerUtxoToAbTexts : MakerUtxoToAbtTexts
    const AbToUtxoTexts = (flow.isTaker) ? TakerAbToUtxoTexts : MakerAbToUtxoTexts

    const swapTexts = (
      <Fragment>
        {
          ['BtcLikeToEth', 'BtcLikeToEthToken'].includes(this.props.swapName) &&
            <UtxoToAbTexts flow={flow} swap={swap} stepName={stepName} />
        }
        {
          ['EthToBtcLike', 'EthTokenToBtcLike'].includes(this.props.swapName) &&
            <AbToUtxoTexts flow={flow} swap={swap} stepName={stepName} />
        }
      </Fragment>
    )

    const showDepositWindow = !enoughBalance && stepName === 'sync-balance'

    return (
      <div styleName={`${isMobile ? 'stepList isMobile' : 'stepList'}`}>
        {!isMobile && <FirstStep text={swapTexts} isFirstStepActive={isFirstStepActive} />}
        <SecondStep
          isFirstStepActive={isFirstStepActive}
          isSecondStepActive={isSecondStepActive}
          text={swapTexts}
          showDepositWindow={showDepositWindow}
          swap={swap}
          fields={this._fields}
        />
        {
          showDepositWindow &&
            <div styleName="swapDepositWindow">
              <DepositWindow currencyData={currencyData} swap={swap} flow={flow} tokenItems={tokenItems} fields={this._fields} />
            </div>
        }
        <ThirdStep
          isFirstStepActive={isFirstStepActive}
          isSecondStepActive={isSecondStepActive}
          isThirdStepActive={isThirdStepActive}
          swap={swap}
          fields={this._fields}
          text={swapTexts}
        />
        {!isMobile && <FourthStep isFourthStepActive={isFourthStepActive} text={swapTexts} />}
      </div>
    )
  }
}
