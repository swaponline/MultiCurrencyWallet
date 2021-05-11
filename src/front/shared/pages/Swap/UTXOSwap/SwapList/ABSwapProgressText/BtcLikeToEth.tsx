import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class BtcLikeToEth extends Component<any, any> {
  BtcLikeToEth = (step, coinName) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="SwapProgress93_btclike_to_eth" defaultMessage="The order creator is offline. Waiting for him.." />
        )
      case 2:
        return (
          <FormattedMessage id="SwapProgress99_btclike_to_eth" defaultMessage="Create a secret key" />
        )
      case 3:
        return (
          <FormattedMessage id="SwapProgress105_btclike_to_eth" defaultMessage="Checking balance.." />
        )
      case 4:
        return (
          <FormattedMessage
            id="SwapProgress111_btclike_to_eth"
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
            id="SwapProgress117_btclike_to_eth"
            defaultMessage="Your {coinName} are now depositing. It may require one confirmation from {coinName} Network. Waiting for other participant to deposit ETH."
            values={{
              coinName,
            }}
          />
        )
      case 6:
        return (
          <FormattedMessage id="SwapProgress123_btclike_to_eth" defaultMessage="ETH Contract created and charged. Requesting withdrawal from ETH Contract." />
        )
      case 7:
        return (
          <FormattedMessage id="SwapProgress129_btclike_to_eth" defaultMessage="ETH was transferred to your wallet. Check the balance." />
        )
      case 8:
        return (
          <FormattedMessage id="SwapProgress135_btclike_to_eth" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.BtcLikeToEth(this.props.step, this.props.coinName)
  }
}
