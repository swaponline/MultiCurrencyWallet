import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class GhostToBtc extends Component<any, any> {
  GhostToBtc = (step) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="ethToBtcText26_ghost_to_btc" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="ethToBtcText20_ghost_to_btc" defaultMessage="Waiting for GHOST Owner to create Secret Key, create GHOST Script and charge it" />
        )
      case 3:
        return (
          <FormattedMessage id="ethToBtcText25_ghost_to_btc" defaultMessage="The ghost Script was created and charged. Check the information below" />
        )
      case 4:
        return (
          <FormattedMessage id="ethToBtcText28_ghost_to_btc" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="ethToBtcText32_ghost_to_btc" defaultMessage="Creating Ethereum Contract.{br}It can take a few minutes" values={{ br: <br /> }} />
        )
      case 6:
        return (
          <FormattedMessage id="ethToBtcText36_ghost_to_btc" defaultMessage="Waiting for BTC Owner to add a Secret Key to ETH Contact" />
        )
      case 7:
        return (
          <FormattedMessage
            id="ethToBtcText40_ghost_to_btc"
            // eslint-disable
            defaultMessage="The funds from ETH contract was successfully transferred to BTC owner.
              BTC owner left a secret key. Requesting withdrawal from BTC script."
          />
        // eslint-enable
        )
      case 8:
        return (
          <FormattedMessage id="ethToBtcText44_ghost_to_btc" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="ethToBtcText48_ghost_to_btc" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.GhostToBtc(this.props.step)
  }
}
