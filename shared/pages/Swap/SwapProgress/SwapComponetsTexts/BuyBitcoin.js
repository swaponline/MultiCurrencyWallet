import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class BuyBitcoin extends Component {
  buyBTC = (step) => {

    const { swap: { sellCurrency, buyCurrency, flow: { stepNumbers } } } = this.props

    switch (step) {
      case stepNumbers.sign:
        return (
          <FormattedMessage id="BitcoinBuyText17" defaultMessage="Please wait. Confirmation processing" />
        )
      case stepNumbers[`wait-lock-${buyCurrency.toLowerCase()}`]:
        return (
          <FormattedMessage
            id="SwapProgress138"
            defaultMessage="Waiting for {buyCurrency} Owner to create Secret Key, create BTC Script and charge it"
            values={{ buyCurrency: `${buyCurrency}` }}
          />
        )
      case stepNumbers[`verify-script`]:
        return (
          <FormattedMessage id="BitcoinBuyText29" defaultMessage="The bitcoin Script was created and charged. Please check the information below" />
        )
      case stepNumbers[`sync-balance`]:
        return (
          <FormattedMessage id="BitcoinBuyText33" defaultMessage="Checking balance.." />
        )
      case stepNumbers[`lock-${sellCurrency.toLowerCase()}`]:
        return (
          <FormattedMessage id="BitcoinBuyText37" defaultMessage="Creating Ethereum Contract. {br} Please wait, it can take a few minutes" values={{ br: <br />, sellCurrency: `${sellCurrency}` }} />
        )
      case stepNumbers[`wait-withdraw-${sellCurrency.toLowerCase()}`]:
        return (
          <FormattedMessage id="BitcoinBuyText41" defaultMessage="Waiting for {buyCurrency} Owner to add a Secret Key to ETH Contact" values={{ buyCurrency: `${buyCurrency}` }} />
        )
      case stepNumbers[`withdraw-${buyCurrency.toLowerCase()}`]:
        return (
          <FormattedMessage id="BitcoinBuyText45" defaultMessage="{buyCurrency} was transferred to your wallet. Check the balance." values={{ buyCurrency: `${buyCurrency}` }} />
        )
      case stepNumbers.finish:
        return (
          <FormattedMessage id="BitcoinBuyText49" defaultMessage="Thank you for using Swap.Online" />
        )
      case stepNumbers.end:
        return (
          <FormattedMessage id="BitcoinBuyText53" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {
    console.log(this.props.swap.flow.state.step)
    return (
      <h1 styleName="stepHeading">{this.buyBTC(this.props.swap.flow.state.step)}</h1>
    )
  }
}
