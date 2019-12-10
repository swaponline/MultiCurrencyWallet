import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class EthToBtc extends Component {
  EthToBtc = (step) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="ethToBtcText26" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="ethToBtcText20" defaultMessage="Waiting for BTC Owner to create Secret Key, create BTC Script and charge it" />
        )
      case 3:
        return (
          <FormattedMessage id="ethToBtcText25" defaultMessage="The bitcoin Script was created and charged. Check the information below" />
        )
      case 4:
        return (
          <FormattedMessage id="ethToBtcText28" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="ethToBtcText32" defaultMessage="Creating Ethereum Contract.{br}It can take a few minutes" values={{ br: <br /> }} />
        )
      case 6:
        return (
          <FormattedMessage id="ethToBtcText36" defaultMessage="Waiting for BTC Owner to add a Secret Key to ETH Contact" />
        )
      case 7:
        return (
          <FormattedMessage
            id="ethToBtcText40"
            // eslint-disable
            defaultMessage="The funds from ETH contract was successfully transferred to BTC owner.
              BTC owner left a secret key. Requesting withdrawal from BTC script."
          />
        // eslint-enable
        )
      case 8:
        return (
          <FormattedMessage id="ethToBtcText44" defaultMessage="Thank you for using  AtomicSwapWallet.io" />
        )
      case 9:
        return (
          <FormattedMessage id="ethToBtcText48" defaultMessage="Thank you for using  AtomicSwapWallet.io!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.EthToBtc(this.props.step)
  }
}
