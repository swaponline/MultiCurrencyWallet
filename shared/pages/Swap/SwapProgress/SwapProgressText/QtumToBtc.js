import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class QtumToBtc extends Component {
  QtumToBtc = (step) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="QtumToBtcText26" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="QtumToBtcText20" defaultMessage="Waiting for BTC Owner to create Secret Key, create BTC Script and charge it" />
        )
      case 3:
        return (
          <FormattedMessage id="QtumToBtcText25" defaultMessage="The bitcoin Script was created and charged. Check the information below" />
        )
      case 4:
        return (
          <FormattedMessage id="QtumToBtcText28" defaultMessage="Checking balance.." />
        )
      case 5:
        return (
          <FormattedMessage id="QtumToBtcText32" defaultMessage="Creating Qtumereum Contract.{br}It can take a few minutes" values={{ br: <br /> }} />
        )
      case 6:
        return (
          <FormattedMessage id="QtumToBtcText36" defaultMessage="Waiting for BTC Owner to add a Secret Key to Qtum Contact" />
        )
      case 7:
        return (
          <FormattedMessage
            id="QtumToBtcText40"
            // eslint-disable
            defaultMessage="The funds from Qtum contract was successfully transferred to BTC owner.
              BTC owner left a secret key. Requesting withdrawal from BTC script."
          />
        // eslint-enable
        )
      case 8:
        return (
          <FormattedMessage id="QtumToBtcText44" defaultMessage="Thank you for using Swap.Online" />
        )
      case 9:
        return (
          <FormattedMessage id="QtumToBtcText48" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.QtumToBtc(this.props.step)
  }
}
