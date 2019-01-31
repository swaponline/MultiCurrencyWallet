import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class BtcToEthTokens extends Component {
  BtcToEthTokens = (step) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="BitcoinBuyText17" defaultMessage="Please wait. Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="BtcToEthToken87" defaultMessage="Waiting participant confirm this swap" />
        )
      case 3:
        return (
          <FormattedMessage id="BitcoinBuyText29" defaultMessage="The bitcoin Script was created and charged. Please check the information below" />
        )
      case 4:
        return (
          <FormattedMessage id="BitcoinBuyText33" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="BitcoinBuyText37" defaultMessage="Creating Ethereum Contract. {br} Please wait, it can take a few minutes" values={{ br: <br /> }} />
        )
      case 6:
        return (
          <FormattedMessage id="BitcoinBuyText41" defaultMessage="Waiting for {buyCurrency} tokens Owner to add a Secret Key to ETH Contact" values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 7:
        return (
          <FormattedMessage id="BitcoinBuyText45" defaultMessage="{buyCurrency} tokens was transferred to your wallet. Check the balance." values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 8:
        return (
          <FormattedMessage id="BitcoinBuyText49" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="BitcoinBuyText53" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {

    return (
      <h1 styleName="stepHeading">{this.BtcToEthTokens(this.props.step)}</h1>
    )
  }
}
