import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class BtcToEth extends Component {
  BtcToEth = (step) => {

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
          <FormattedMessage id="SwapProgress111_BTC_ETH" defaultMessage="Creating Bitcoin Script.{br}It can take a few minutes" values={{ br: <br /> }} />
        )
      case 5:
        return (
          <FormattedMessage id="SwapProgress117_BTC_ETH" defaultMessage="Your BTC are now depositing. It may require one confirmation from Bitcoin Network. Waiting for other participant to deposit ETH." />
        )
      case 6:
        return (
          <FormattedMessage id="SwapProgress123_BTC_ETH" defaultMessage="ETH Contract created and charged. Requesting withdrawal from ETH Contract." />
        )
      case 7:
        return (
          <FormattedMessage id="SwapProgress129_BTC_ETH" defaultMessage="ETH was transferred to your wallet. Check the balance." />
        )
      case 8:
        return (
          <FormattedMessage id="SwapProgress135_BTC_ETH" defaultMessage="Thank you for using Swap.Onlinde!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.BtcToEth(this.props.step)
  }
}
