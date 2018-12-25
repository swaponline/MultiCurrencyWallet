import React, { Component } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SwapProgress.scss'

import step1_icon from './images/1.gif'
import step2_icon from './images/2.gif'
import step3_icon from './images/3.gif'
import step5_icon from './images/5.gif'
import step6_icon from './images/6.gif'
import step7_icon from './images/7.gif'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import Title from 'components/PageHeadline/Title/Title'
import Logo from 'components/Logo/Logo'
import { FormattedMessage } from 'react-intl'
import { Button } from 'components/controls'


@CSSModules(styles, { allowMultiple: true })
export default class SwapProgress extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  static defaultProps = {
    data: {},
    whiteLogo: false,
  }

  handleStepChangeImage = (step) => {
    switch (step) {
      case 1:
        return (
          <img src={step1_icon} alt="step1" />
        )
      case 2:
        return (
          <img src={step2_icon} alt="step2" />
        )
      case 3:
        return (
          <img src={step3_icon} alt="step3" />
        )
      case 4:
        return (
          <img src={step3_icon} alt="step2" />
        )
      case 5:
        return (
          <img src={step5_icon} alt="step5" />
        )
      case 6:
        return (
          <img src={step6_icon} alt="step6" />
        )
      case 7:
        return (
          <img src={step7_icon} alt="step7" />
        )
      case 8:
        return (
          <img src={step7_icon} alt="step7" />
        )
      case 9:
        return (
          <img src={step7_icon} alt="step7" />
        )
      default:
        return null
    }
  } 

  handleStepEthToBtc = (step) => {
    switch (step) {
      case 1:
        return (
            <FormattedMessage id="SwapProgress32" defaultMessage="Please wait. Confirmation processing" />
        )
      case 2:
        return (
            <FormattedMessage id="SwapProgress38" defaultMessage="Waiting BTC Owner creates Secret Key, creates BTC Script and charges it" />
        )
      case 3:
        return (
            <FormattedMessage id="SwapProgress44" defaultMessage="Bitcoin Script created and charged. Please check the information below" />
        )
      case 4:
        return (
            <FormattedMessage id="SwapProgress50" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
            <FormattedMessage id="SwapProgress56" defaultMessage="Creating Ethereum Contract. Please wait, it will take a while" />
        )
      case 6:
        return (
            <FormattedMessage id="SwapProgress62" defaultMessage="Waiting BTC Owner adds Secret Key to ETH Contact" />
        )
      case 7:
        return (
            <FormattedMessage id="SwapProgress68" defaultMessage="Money was transferred to your wallet. Check the balance." />
        )
      case 8:
        return (
            <FormattedMessage id="SwapProgress74" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
            <FormattedMessage id="SwapProgress80" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  handleStepBtcToEth = (step) => {
    switch (step) {
      case 1:
        return (
            <FormattedMessage id="SwapProgress93" defaultMessage="The order creator is offline. Waiting for him.." />
        )
      case 2:
        return (
            <FormattedMessage id="SwapProgress99" defaultMessage="Create a secret key" />
        )
      case 3:
        return (
            <FormattedMessage id="SwapProgress105" defaultMessage="Checking balance.." />
        )
      case 4:
        return (
            <FormattedMessage id="SwapProgress111" defaultMessage="Creating Bitcoin Script. Please wait, it will take a while" />
        )
      case 5:
        return (
            <FormattedMessage id="SwapProgress117" defaultMessage="ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract" />
        )
      case 6:
        return (
            <FormattedMessage id="SwapProgress123" defaultMessage="ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait" />
        )
      case 7:
        return  (
            <FormattedMessage id="SwapProgress129" defaultMessage="Money was transferred to your wallet. Check the balance." />
        )
      case 8:
        return (
            <FormattedMessage id="SwapProgress135" defaultMessage="Thank you for using Swap.Onlinde!" />
        )
      default:
        return null
    }
  }


  render() {
    const progress = Math.floor(360 / this.props.stepLength * this.props.data.step)

    return (
      <div styleName="overlay">
        <div styleName="container">
          <span styleName="steps">{this.props.data.step} / {this.props.stepLength} steps</span>
          <div styleName="stepContainer">
            <div styleName={progress > 180 ? 'progress-pie-chart gt-50' : 'progress-pie-chart'}>
              <div styleName="ppc-progress">
                <div styleName="ppc-progress-fill" style={{ transform: `rotate(${progress}deg)` }}></div>
              </div>
            </div>
            <div styleName="step">
              <div styleName="stepImg">
                {this.handleStepChangeImage(this.props.data.step)}
              </div>
              <div styleName="stepInfo">
                {
                  this.props.name === 'BTC2ETH' && <h1 styleName="stepHeading">{this.handleStepBtcToEth(this.props.data.step)}</h1>
                }
                {
                  this.props.name === 'ETH2BTC' && <h1 styleName="stepHeading">{this.handleStepEthToBtc(this.props.data.step)}</h1>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
