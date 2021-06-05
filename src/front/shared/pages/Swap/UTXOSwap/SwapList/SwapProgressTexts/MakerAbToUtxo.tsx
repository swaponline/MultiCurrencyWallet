import React, { Component } from 'react'

import { FormattedMessage } from 'react-intl'

export default class MakerAbToUtxoTexts extends Component<any, any> {
  getMakerAbToUtxoText = (stepName) => {

    switch (stepName) {
      case 'sign':
        return (
          <FormattedMessage
            id="SwapProgressText_FirstStep"
            defaultMessage="Please wait"
          />
        )
      case 'wait-lock-utxo':
        return (
          <FormattedMessage
            id="SwapProgressText_WaitPatricipantDeposit"
            defaultMessage="Waiting for other participant to deposit {buyCurrency}"
            values={{
              buyCurrency: `${this.props.swap.buyCurrency}`
            }}
          />
        )
      case 'verify-script':
        return (
          <FormattedMessage
            id="SwapProgressText_VerifyScript"
            defaultMessage="The {buyCurrency} Script was created and charged"
            values={{
              buyCurrency: `${this.props.swap.buyCurrency}`
            }}
          />
        )
      case 'sync-balance':
        return (
          <FormattedMessage
            id="SwapProgressText_CheckingBalance"
            defaultMessage="Checking balance.."
          />
        )
      case 'lock-eth':
        return (
          <FormattedMessage
            id="SwapProgressText_DepositingYourSide"
            defaultMessage="Depositing {sellCurrency}.{br}It can take a few minutes"
            values={{
              br: <br />,
              sellCurrency: `${this.props.swap.sellCurrency}`
            }}
          />
        )
      case 'wait-withdraw-eth':
        return (
          <FormattedMessage
            id="SwapProgressText_MakerWaitTakerWithdraw"
            defaultMessage="Waiting for {buyCurrency} Owner to add a Secret Key to {sellCurrency} Contact"
            values={{
              buyCurrency: `${this.props.swap.buyCurrency}`,
              sellCurrency: `${this.props.swap.sellCurrency}`
            }}
          />
        )
      case 'withdraw-utxo':
        return (
          <FormattedMessage
            id="SwapProgressText_WithdrawRequest"
            defaultMessage="Requesting withdrawal from {buyCurrency} Contract"
            values={{
              buyCurrency: `${this.props.swap.buyCurrency}`
            }}
          />
        )
      case 'finish':
        return (
          <FormattedMessage
            id="SwapProgressText_Finish"
            defaultMessage="{buyCurrency} tokens was transferred to your wallet. Check the balance"
            values={{
              buyCurrency: `${this.props.swap.buyCurrency}`
            }}
          />
        )
      case 'end':
        return (
          <FormattedMessage id="SwapProgressText_End" defaultMessage="Thank you for using Swap.Online!" />
        )
      default:
        return null
    }
  }

  render() {

    return this.getMakerAbToUtxoText(this.props.stepName)
  }
}
