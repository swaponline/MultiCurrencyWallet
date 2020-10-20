import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class EthToBtcLike extends Component {
  EthToBtcLike = (step, coinName) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="ethToBtcText26_eth_to_btclike" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage
            id="ethToBtcText20_eth_to_btclike"
            defaultMessage="Waiting for {coinName} Owner to create Secret Key, create {coinName} Script and charge it"
            values={{
              coinName,
            }}
          />
        )
      case 3:
        return (
          <FormattedMessage
            id="ethToBtcText25_eth_to_btclike"
            defaultMessage="The {coinName} Script was created and charged. Check the information below"
            values={{
              coinName,
            }}
          />
        )
      case 4:
        return (
          <FormattedMessage id="ethToBtcText28_eth_to_btclike" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="ethToBtcText32_eth_to_btclike" defaultMessage="Creating Ethereum Contract.{br}It can take a few minutes" values={{ br: <br /> }} />
        )
      case 6:
        return (
          <FormattedMessage
            id="ethToBtcText36_eth_to_btclike"
            defaultMessage="Waiting for {coinName} Owner to add a Secret Key to ETH Contact"
            values={{
              coinName,
            }}
          />
        )
      case 7:
        return (
          <FormattedMessage
            id="ethToBtcText40_eth_to_btclike"
            // eslint-disable
            defaultMessage="The funds from ETH contract was successfully transferred to {coinName} owner.
              {coinName} owner left a secret key. Requesting withdrawal from {coinName} script."
            values={{
              coinName,
            }}
          />
        // eslint-enable
        )
      case 8:
        return (
          <FormattedMessage id="ethToBtcText44_eth_to_btclike" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="ethToBtcText48_eth_to_btclike" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {
    return this.EthToBtcLike(this.props.step, this.props.coinName)
  }
}
