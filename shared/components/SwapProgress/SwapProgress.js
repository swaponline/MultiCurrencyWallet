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
import * as animation from './images'


@CSSModules(styles, { allowMultiple: true })
export default class SwapProgress extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  static defaultProps = {
    data: {},
    whiteLogo: false,
  }


  // TODO add animation css, if the app will have error and try to on 10s step, will show the 9th of animathin

  handleStepChangeImage = (step) => {
    if (step < 10) {
      return <img src={animation[`icon${step}`]} alt="step" />
    }
    if (step === 10) {
      // eslint-disable-next-line
      return <img src={animation['icon9']} alt="step" />
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
          <FormattedMessage id="SwapProgress38" defaultMessage="Waiting for BTC Owner to create Secret Key, create BTC Script and charge it" />
        )
      case 3:
        return (
          <FormattedMessage id="SwapProgress44" defaultMessage="The bitcoin Script was created and charged. Please check the information below" />
        )
      case 4:
        return (
          <FormattedMessage id="SwapProgress50" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="SwapProgress56" defaultMessage="Creating Ethereum Contract. \n Please wait, it can take a few minutes" />
        )
      case 6:
        return (
          <FormattedMessage id="SwapProgress62" defaultMessage="Waiting for BTC Owner to add a Secret Key to ETH Contact" />
        )
      case 7:
        return (
          <FormattedMessage id="SwapProgress68" defaultMessage="BTC was transferred to your wallet. Check the balance." />
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
          <FormattedMessage id="SwapProgress111" defaultMessage="Creating Bitcoin Script. \n Please wait, it can take a few minutes" />
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
          <FormattedMessage id="SwapProgress129" defaultMessage="ETH was transferred to your wallet. Check the balance." />
        )
      case 8:
        return (
          <FormattedMessage id="SwapProgress135" defaultMessage="Thank you for using Swap.Onlinde!" />
        )
      default:
        return null
    }
  }

  handleStepEthTokenToBtc = (step) => {
    switch (step) {
      case 1:
        return (
          <FormattedMessage id="SwapProgress32" defaultMessage="Please wait. Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="SwapProgress38" defaultMessage="Waiting for BTC Owner to create Secret Key, create BTC Script and charge it" />
        )
      case 3:
        return (
          <FormattedMessage id="SwapProgress44" defaultMessage="The bitcoin Script was created and charged. Please check the information below" />
        )
      case 4:
        return (
          <FormattedMessage id="SwapProgress50" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="SwapProgress56" defaultMessage="Creating Ethereum Contract. \n Please wait, it can take a few minutes" />
        )
      case 6:
        return (
          <FormattedMessage id="SwapProgress62" defaultMessage="Waiting for BTC Owner to add a Secret Key to ETH Contact" />
        )
      case 7:
        return (
          <FormattedMessage id="EthToBtc357" defaultMessage="The funds from ETH contract was successfully transferred to BTC owner. BTC owner left a secret key. Requesting withdrawal from BTC script. Please wait." />
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

  render() {
    const progress = Math.floor(360 / this.props.stepLength * this.props.data.step)

    return (
      <div styleName="overlay">
        <div styleName="container">
          <div styleName="stepContainer">
            <div styleName="progressContainer">
              <div styleName={progress > 180 ? 'progress-pie-chart gt-50' : 'progress-pie-chart'}>
                <div styleName="ppc-progress">
                  <div styleName="ppc-progress-fill" style={{ transform: `rotate(${progress}deg)` }} />
                </div>
              </div>
              <div styleName="step">
                <div styleName="stepImg">
                  {this.handleStepChangeImage(this.props.data.step)}
                </div>
              </div>
            </div>
            <div styleName="stepInfo">
              {
                this.props.name === 'BTC2ETH' && <h1 styleName="stepHeading">{this.handleStepBtcToEth(this.props.data.step)}</h1>
              }
              {
                this.props.name === 'ETH2BTC' && <h1 styleName="stepHeading">{this.handleStepEthToBtc(this.props.data.step)}</h1>
              }
              {
                this.props.name === 'ETHTOKEN2BTC' && <h1 styleName="stepHeading">{this.handleStepEthTokenToBtc(this.props.data.step)}</h1>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}
