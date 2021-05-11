import React, { Component } from 'react'

import { FormattedMessage } from 'react-intl'

export default class EthToBtcLike extends Component<any, any> {
  EthToBtcLike = (step, coinName) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="EthTokensToBtc16_ethtoken_to_BtcLike" defaultMessage="Confirmation processing" />
        )
      case 2:
        return (
          <FormattedMessage id="EthTokensToBtc28_ethtoken_to_BtcLike" defaultMessage="Checking balance.." />
        )
      case 3:
        return (
          <FormattedMessage id="EthTokensToBtc32_ethtoken_to_BtcLike" defaultMessage="Creating Ethereum Contract. {br} It can take a few minutes" values={{ br: <br /> }} />
        )
      case 4:
        return (
          <FormattedMessage
            id="EthTokensToBtc20_ethtoken_to_BtcLikeTaker"
            defaultMessage="Waiting for {coinName} Owner to create {coinName} Script and charge it"
            values={{
              coinName,
            }}
          />
        )
      case 5:
        return (
          <FormattedMessage
            id="EthTokensToBtc24_ethtoken_to_BtcLike"
            defaultMessage="The {coinName} Script was created and charged. Check the information below"
            values={{
              coinName,
            }}
          />
        )
      case 7:
        return (
          <FormattedMessage id="EthTokensToBtc44_ethtoken_to_BtcLike" defaultMessage="Thank you for using Swap.Online" />
        )
      default:
        return null
    }
  }

  render() {
    return this.EthToBtcLike(this.props.step, this.props.coinName)
  }
}
