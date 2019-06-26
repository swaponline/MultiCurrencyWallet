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
          <FormattedMessage id="SwapProgress111" defaultMessage="Creating Bitcoin Script.{br}Please wait, it can take a few minutes" values={{ br: <br /> }} />
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

  render() {

    return (
      <h1 styleName="stepHeading">{this.BtcToEth(this.props.step)}</h1>
    )
  }
}
