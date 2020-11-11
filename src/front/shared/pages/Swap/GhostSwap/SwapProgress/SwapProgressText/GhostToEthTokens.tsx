import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class GhostToEthTokens extends Component<any, any> {
  GhostToEthTokens = (step) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="BitcoinBuyText17_ghost_to_tokens" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="BtcToEthToken20_ghost_to_tokens" defaultMessage="Create a secret key" />
        )
      case 3:
        return (
          <FormattedMessage id="BitcoinBuyText29_ghost_to_tokens" defaultMessage="Checking balance.." />
        )
      case 4:
        return (
          <FormattedMessage id="BitcoinBuyText33_ghost_to_tokens" defaultMessage="Creating GHOST Script.{br}It can take a few minutes" values={{ br: <br /> }} />
        )
      case 5:
        return (
          <FormattedMessage
            id="BitcoinBuyText37_ghost_to_tokens"
            defaultMessage="{buyCurrency} Owner received GHOST Script and Secret Hash. Waiting when he creates {buyCurrency} Contract"
            values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 6:
        return (
          <FormattedMessage
            id="BitcoinBuyText41_ghost_to_tokens"
            defaultMessage="{buyCurrency} Contract created and charged. Requesting withdrawal from {buyCurrency} Contract."
            values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 7:
        return (
          <FormattedMessage
            id="BitcoinBuyText45_ghost_to_tokens"
            defaultMessage="{buyCurrency} tokens was transferred to your wallet. Check the balance."
            values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 8:
        return (
          <FormattedMessage id="BitcoinBuyText49_ghost_to_tokens" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="BitcoinBuyText53_ghost_to_tokens" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.GhostToEthTokens(this.props.step)
  }
}
