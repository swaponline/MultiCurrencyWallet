import React, { Component } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { links } from 'helpers'

import CSSModules from 'react-css-modules'
import styles from './SwapProgress.scss'

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


  // TODO add animation css

  handleStepChangeImage = (step) => {
    // eslint-disable-next-line
    const icon = require(`./images/icon${step}.gif`)
    return <img src={icon} alt="step" />
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
          {/*<span styleName="steps">{this.props.data.step} / {this.props.stepLength} steps</span>*/}
          <div styleName="stepList">
              {
                this.props.data.step >= 1 ? (
                  <div styleName={this.props.data.step == 1 && this.props.data.step < 2 ? 'stepItem active' : 'stepItem active checked'}>
                    <span styleName="stepNumber">{this.props.data.step == 1 && this.props.data.step < 2 ? '1' : <i className="fas fa-check" />}</span>
                    <p styleName="stepText">Confirmation processing</p>
                  </div>
                ) : (
                  <div styleName="stepItem">
                    <span styleName="stepNumber">1</span>
                    <p styleName="stepText">Confirmation processing</p>
                  </div>
                )
              }

              {
                this.props.data.step >= 2 ? (
                  <div styleName={this.props.data.step == 2 && this.props.data.step <= 3 ? 'stepItem active' : 'stepItem active checked'}>
                    <span styleName="stepNumber">{this.props.data.step == 2 && this.props.data.step < 3 ? '2' : <i className="fas fa-check" />}</span>
                    <p styleName="stepText">Bitcoin deposition</p>
                  </div>
                ) : (
                  <div styleName="stepItem">
                    <span styleName="stepNumber">2</span>
                    <p styleName="stepText">Bitcoin deposition</p>
                  </div>
                )
              }

              {
                this.props.data.step >= 4 ? (
                  <div styleName={this.props.data.step == 4 && this.props.data.step < 5 ? 'stepItem active' : 'stepItem active checked'}>
                    <span styleName="stepNumber">{this.props.data.step == 4 && this.props.data.step < 5 ? '3' : <i className="fas fa-check" />}</span>
                    <p styleName="stepText">Swap tokens deposition</p>
                  </div>
                ) : (
                  <div styleName="stepItem">
                    <span styleName="stepNumber">3</span>
                    <p styleName="stepText">Swap tokens deposition</p>
                  </div>
                )
              }

              {
                this.props.data.step >= 5 ? (
                <div styleName={this.props.data.step >= 5 && this.props.data.step < 6 ? 'stepItem active' : 'stepItem active checked'}>
                  <span styleName="stepNumber">{this.props.data.step >= 5 && this.props.data.step < 6 ? '4' : <i className="fas fa-check" />}</span>
                  <p styleName="stepText">Withdrawing swap tokens from a contract</p>
                </div>
                ) : (
                  <div styleName="stepItem">
                    <span styleName="stepNumber">4</span>
                    <p styleName="stepText">Withdrawing swap tokens from a contract</p>
                  </div>
                )
              }
              {
                this.props.data.step >= 6 ? (
                  <div styleName={this.props.data.step >= 6 && this.props.data.step < 7 ? 'stepItem active' : 'stepItem active checked'}>
                    <span styleName="stepNumber">{this.props.data.step >= 6 && this.props.data.step < 7 ? '5' : <i className="fas fa-check" />}</span>
                    <p styleName="stepText">Finished!</p>
                  </div>
                ) : (
                  <div styleName="stepItem">
                    <span styleName="stepNumber">5</span>
                    <p styleName="stepText">Finished!</p>
                  </div>
                )
              }
          </div>
          <div styleName="stepContainer">
            <div styleName={progress > 180 ? 'progress-pie-chart gt-50' : 'progress-pie-chart'}>
              <div styleName="ppc-progress">
                <div styleName="ppc-progress-fill" style={{ transform: `rotate(${progress}deg)` }} />
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
