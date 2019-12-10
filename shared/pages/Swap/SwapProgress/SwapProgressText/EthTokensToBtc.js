import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class EthTokensToBtc extends Component {
  EthTokensToBtc = (step) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="EthTokensToBtc16" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="EthTokensToBtc20" defaultMessage="Waiting for BTC Owner to create Secret Key, create BTC Script and charge it" />
        )
      case 3:
        return (
          <FormattedMessage id="EthTokensToBtc24" defaultMessage="The bitcoin Script was created and charged. Check the information below" />
        )
      case 4:
        return (
          <FormattedMessage id="EthTokensToBtc28" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="EthTokensToBtc32" defaultMessage="Creating Ethereum Contract. {br} It can take a few minutes" values={{ br: <br /> }} />
        )
      case 6:
        return (
          <FormattedMessage id="EthTokensToBtc36" defaultMessage="Waiting for BTC Owner to add a Secret Key to ETH Contact" />
        )
      case 7:
        return (
          <FormattedMessage
            id="EthTokensToBtc40"
            defaultMessage="The funds from ETH contract was successfully transferred to BTC owner"
          />
        )
      case 8:
        return (
          <FormattedMessage id="EthTokensToBtc44" defaultMessage="Thank you for using  AtomicSwapWallet.io" />
        )
      case 9:
        return (
          <FormattedMessage id="EthTokensToBtc48" defaultMessage="Thank you for using  AtomicSwapWallet.io!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.EthTokensToBtc(this.props.step)
  }
}
