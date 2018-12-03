import React, { Component } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './SwapProgress.scss'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import CloseIcon from 'components/ui/CloseIcon/CloseIcon'
import Title from 'components/PageHeadline/Title/Title'
import Logo from 'components/Logo/Logo'
import { FormattedMessage } from 'react-intl'


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
        return (
          <FormattedMessage id="SwapProgress32" defaultMessage="1. Please wait. Confirmation processing">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 2:
        return (
          <FormattedMessage id="SwapProgress38" defaultMessage="2. Waiting BTC Owner creates Secret Key, creates BTC Script and charges it">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 3:
        return (
          <FormattedMessage id="SwapProgress44" defaultMessage="3. Bitcoin Script created and charged. Please check the information below">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 4:
        return (
          <FormattedMessage id="SwapProgress50" defaultMessage="4. Checking balance..">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 5:
        return (
          <FormattedMessage id="SwapProgress56" defaultMessage="5. Creating Ethereum Contract. Please wait, it will take a while">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 6:
        return (
          <FormattedMessage id="SwapProgress62" defaultMessage="6. Waiting BTC Owner adds Secret Key to ETH Contact">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 7:
        return (
          <FormattedMessage id="SwapProgress68" defaultMessage="7. Money was transferred to your wallet. Check the balance.">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 8:
        return (
          <FormattedMessage id="SwapProgress74" defaultMessage="Thank you for using Swap.Online!">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 9:
        return (
          <FormattedMessage id="SwapProgress80" defaultMessage="Thank you for using Swap.Online!">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      default:
        return null
    }
  }

  handleStepBtcToEth = (step) => {
    switch (step) {
      case 1:
        return (
          <FormattedMessage id="SwapProgress93" defaultMessage="1. The order creator is offline. Waiting for him..">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 2:
        return (
          <FormattedMessage id="SwapProgress99" defaultMessage="2. Create a secret key">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 3:
        return (
          <FormattedMessage id="SwapProgress105" defaultMessage="3. Checking balance..">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 4:
        return (
          <FormattedMessage id="SwapProgress111" defaultMessage="4. Creating Bitcoin Script. Please wait, it will take a while">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 5:
        return (
          <FormattedMessage id="SwapProgress117" defaultMessage="5. ETH Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 6:
        return (
          <FormattedMessage id="SwapProgress123" defaultMessage="6. ETH Contract created and charged. Requesting withdrawal from ETH Contract. Please wait">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 7:
        return  (
          <FormattedMessage id="SwapProgress129" defaultMessage="7. Money was transferred to your wallet. Check the balance.">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
      case 8:
        return (
          <FormattedMessage id="SwapProgress135" defaultMessage="Thank you for using Swap.Online!">
            {message => <Title>{message}</Title>}
          </FormattedMessage>
        )
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
            <FormattedMessage id="SwapProgress157" defaultMessage="SwapProgress">
              {message => <div role="title" styleName="title">{message}</div>}
            </FormattedMessage>
            <CloseIcon styleName="closeButton" onClick={this.close} data-testid="modalCloseIcon" />
          </WidthContainer>
        </div>
        <div styleName="container">
          <div styleName="progress">
            <div styleName="bar" style={{ width: `${progress}%` }} />
          </div>
          <span styleName="steps">{flow.step} / {length} steps</span>
          <div styleName="info">
            {name === 'ETH2BTC' ? this.handleStepEthToBtc(flow.step) : this.handleStepBtcToEth(flow.step)}
          </div>
        </div>
      </div>
    )
  }
}
