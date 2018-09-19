import React, { Component } from 'react'

import actions from 'redux/actions'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './SwapProgress.scss'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import Title from 'components/PageHeadline/Title/Title'
import Logo from 'components/Logo/Logo'

@CSSModules(styles, { allowMultiple: true })
export default class SwapProgress extends Component {

  static propTypes = {
    data: PropTypes.object,
  }

  static defaultProps = {
    data: {},
    whiteLogo: false,
  }

  handleStepEthToBtc = (step) => {
    switch (step) {
      case 1:
        return <Title>1. Please wait. Confirmation processing</Title>
      case 2:
        return <Title>2. Waiting BTC Owner creates Secret Key, creates BTC Script and charges it</Title>
      case 3:
        return <Title>3. Bitcoin Script created and charged. Please check the information below</Title>
      case 4:
        return <Title>4. Checking balance..</Title>
      case 5:
        return <Title>5. Creating Ethereum Contract. Please wait, it will take a while</Title>
      case 6:
        return <Title>6. Waiting BTC Owner adds Secret Key to ETH Contact</Title>
      case 7:
        return <Title>7. Money was transferred to your wallet. Check the balance.</Title>
      case 8:
        return <Title>Thank you for using Swap.Online!</Title>
      case 9:
        return <Title>Thank you for using Swap.Online!</Title>
      default:
        return null
    }
  }

  handleStepBtcToEth = (step) => {
    switch (step) {
      case 1:
        return <Title>1. The order creator is offline. Waiting for him..</Title>
      case 2:
        return <Title>2. Create a secret key</Title>
      case 3:
        return <Title>3. Checking balance..</Title>
      case 4:
        return <Title>4. Creating Bitcoin Script. Please wait, it will take a while</Title>
      case 5:
        return <Title>5. ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract</Title>
      case 6:
        return <Title>6. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait</Title>
      case 7:
        return <Title>7. Money was transferred to your wallet. Check the balance.</Title>
      case 8:
        return <Title>Thank you for using Swap.Online!</Title>
      default:
        return null
    }
  }

  close = () => {
    actions.loader.hide()
  }

  render() {
    const { data: { flow, name, length }, whiteLogo } = this.props
    const progress = Math.floor(100 / length * flow.step)

    return (
      <div styleName="overlay">
        <div styleName="header">
          <WidthContainer styleName="headerContent">
            <Logo colored={!whiteLogo} />
            <div role="title" styleName="title">SwapProgress</div>
            <CloseIcon styleName="closeButton" onClick={this.close} data-testid="modalCloseIcon" />
          </WidthContainer>
        </div>
        <div styleName="container">
          <div styleName="progress">
            <div styleName="bar" style={{ width: `${progress}%` }} />
          </div>
          <span styleName="steps">{flow.step} / {length} steps</span>
          <span styleName="info">{name === 'ETH2BTC' ? this.handleStepEthToBtc(flow.step) : this.handleStepBtcToEth(flow.step)}</span>
        </div>
      </div>
    )
  }
}

