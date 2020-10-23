import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class EthTokenToBtcLike extends Component {
  EthTokenToBtcLike = (step, coinName) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="EthTokensToBtc16_ethtoken_to_BtcLike" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage
            id="EthTokensToBtc20_ethtoken_to_BtcLike"
            defaultMessage="Waiting for {coinName} Owner to create Secret Key, create {coinName} Script and charge it"
            values={{
              coinName,
            }}
          />
        )
      case 3:
        return (
          <FormattedMessage
            id="EthTokensToBtc24_ethtoken_to_BtcLike"
            defaultMessage="The {coinName} Script was created and charged. Check the information below"
            values={{
              coinName,
            }}
          />
        )
      case 4:
        return (
          <FormattedMessage id="EthTokensToBtc28_ethtoken_to_BtcLike" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="EthTokensToBtc32_ethtoken_to_BtcLike" defaultMessage="Creating Ethereum Contract. {br} It can take a few minutes" values={{ br: <br /> }} />
        )
      case 6:
        return (
          <FormattedMessage id="EthTokensToBtc36_ethtoken_to_BtcLike"
            defaultMessage="Waiting for {coinName} Owner to add a Secret Key to ETH Contact"
            values={{
              coinName,
            }}
          />
        )
      case 7:
        return (
          <FormattedMessage
            id="EthTokensToBtc40_ethtoken_to_BtcLike"
            defaultMessage="The funds from ETH contract was successfully transferred to {coinName} owner"
            values={{
              coinName,
            }}
          />
        )
      case 8:
        return (
          <FormattedMessage id="EthTokensToBtc44_ethtoken_to_BtcLike" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="EthTokensToBtc48_ethtoken_to_BtcLike" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.EthTokenToBtcLike(this.props.step, this.props.coinName)
  }
}
