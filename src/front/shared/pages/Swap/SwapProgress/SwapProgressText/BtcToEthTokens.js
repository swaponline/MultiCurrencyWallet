import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class BtcToEthTokens extends Component {
  BtcToEthTokens = (step, flow) => {

    const { waitBtcConfirm } = flow

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="BitcoinBuyText17_btc_to_ethtoken" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="BtcToEthToken20_btc_to_ethtoken" defaultMessage="Create a secret key" />
        )
      case 3:
        return (
          <FormattedMessage id="BitcoinBuyText29_btc_to_ethtoken" defaultMessage="Checking balance.." />
        )
      case 4:
        return (
          <FormattedMessage id="BitcoinBuyText33_btc_to_ethtoken" defaultMessage="Creating Bitcoin Script.{br}It can take a few minutes" values={{ br: <br /> }} />
        )
      case 5:
        return (waitBtcConfirm) ?
          (
            <FormattedMessage
              id="BitcoinBuyText37_btc_to_ethtoken"
              defaultMessage="{buyCurrency} Owner received Bitcoin Script and Secret Hash. Waiting confirm TX and when he creates {buyCurrency} Contract"
              values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
          ) : (
            <FormattedMessage
              id="BitcoinBuyText37_btc_to_ethtoken"
              defaultMessage="{buyCurrency} Owner received Bitcoin Script and Secret Hash. Waiting when he creates {buyCurrency} Contract"
              values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
          )
      case 6:
        return (
          <FormattedMessage
            id="BitcoinBuyText41_btc_to_ethtoken"
            defaultMessage="{buyCurrency} Contract created and charged. Requesting withdrawal from {buyCurrency} Contract."
            values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 7:
        return (
          <FormattedMessage
            id="BitcoinBuyText45_btc_to_ethtoken"
            defaultMessage="{buyCurrency} tokens was transferred to your wallet. Check the balance."
            values={{ buyCurrency: `${this.props.swap.buyCurrency}` }} />
        )
      case 8:
        return (
          <FormattedMessage id="BitcoinBuyText49_btc_to_ethtoken" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="BitcoinBuyText53_btc_to_ethtoken" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {
    const {
      step,
      flow,
    } = this.props

    return this.BtcToEthTokens(step, flow)
  }
}
