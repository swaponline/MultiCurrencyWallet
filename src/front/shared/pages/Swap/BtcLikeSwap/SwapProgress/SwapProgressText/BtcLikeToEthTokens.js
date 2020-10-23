import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class BtcLikeToEthTokens extends Component {
  GhostToEthTokens = (step) => {

    switch (step, coinName) {
      case 1:
        return (
          <FormattedMessage id="BitcoinBuyText17_BtcLike_to_tokens" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="BtcToEthToken20_BtcLike_to_tokens" defaultMessage="Create a secret key" />
        )
      case 3:
        return (
          <FormattedMessage id="BitcoinBuyText29_BtcLike_to_tokens" defaultMessage="Checking balance.." />
        )
      case 4:
        return (
          <FormattedMessage
            id="BitcoinBuyText33_BtcLike_to_tokens"
            defaultMessage="Creating {coinName} Script.{br}It can take a few minutes"
            values={{
              br: <br />,
              coinName,
            }}
          />
        )
      case 5:
        return (
          <FormattedMessage
            id="BitcoinBuyText37_BtcLike_to_tokens"
            defaultMessage="{buyCurrency} Owner received {coinName} Script and Secret Hash. Waiting when he creates {buyCurrency} Contract"
            values={{
              buyCurrency: `${this.props.swap.buyCurrency}`,
              coinName,
            }}
          />
        )
      case 6:
        return (
          <FormattedMessage
            id="BitcoinBuyText41_BtcLike_to_tokens"
            defaultMessage="{buyCurrency} Contract created and charged. Requesting withdrawal from {buyCurrency} Contract."
            values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 7:
        return (
          <FormattedMessage
            id="BitcoinBuyText45_BtcLike_to_tokens"
            defaultMessage="{buyCurrency} tokens was transferred to your wallet. Check the balance."
            values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 8:
        return (
          <FormattedMessage id="BitcoinBuyText49_BtcLike_to_tokens" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="BitcoinBuyText53_BtcLike_to_tokens" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.BtcLikeToEthTokens(this.props.step, this.props.coinName)
  }
}
