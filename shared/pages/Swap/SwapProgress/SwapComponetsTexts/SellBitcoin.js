import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class SellBitcoin extends Component {

  sellBTC = (step) => {
    const { swap: { sellCurrency, buyCurrency, flow : { stepNumbers } } } = this.props

    switch (step) {
      case stepNumbers.sign:
        return (
          <FormattedMessage id="BitcoinSellText18" defaultMessage="The order creator is offline. Waiting for him.." />
        )
      case stepNumbers[`submit-secret`]:
        return (
          <FormattedMessage id="BitcoinSellText22" defaultMessage="Create a secret key" />
        )
      case stepNumbers[`sync-balance`]:
        return (
          <FormattedMessage id="BitcoinSellText26" defaultMessage="Checking balance.." />
        )
      case stepNumbers[`lock-${sellCurrency.toLowerCase()}`]:
        return (
          <FormattedMessage id="BitcoinSellText30" defaultMessage="Creating Bitcoin Script. {br} Please wait, it can take a few minutes" values={{ br: <br />, sellCurrency: `${sellCurrency}` }} />
        )
      case stepNumbers[`wait-lock-${buyCurrency.toLowerCase()}`]:
        return (
          <FormattedMessage
            id="BitcoinSellText35"
            defaultMessage="{buyCurrency} Owner received Bitcoin Script and Secret Hash. Waiting when he creates ETH Contract"
            values={{ buyCurrency: `${buyCurrency}` }} />
        )
      case stepNumbers[`withdraw-${buyCurrency.toLowerCase()}`]:
        return (
          <FormattedMessage
            id="BitcoinSellText42"
            defaultMessage="ETH Contract created and charged. Requesting withdrawal {buyCurrency} from ETH Contract. Please wait"
            values={{ buyCurrency: `${buyCurrency}` }}
          />
        )
      case stepNumbers.finish:
        return  (
          <FormattedMessage id="BitcoinSellText48" defaultMessage="{buyCurrency} was transferred to your wallet. Check the balance." values={{ buyCurrency: `${buyCurrency}` }} />
        )
      case stepNumbers.end:
        return (
          <FormattedMessage id="BitcoinSellText52" defaultMessage="Thank you for using Swap.Onlinde!" />
        )
      case stepNumbers.end:
        return (
          <FormattedMessage id="BitcoinSellText56" defaultMessage="Thank you for using Swap.Onlinde!" />
        )
      default:
        return null
    }
  }

  render() {
  
    return (
      <h1 styleName="stepHeading">{this.sellBTC(this.props.swap.flow.state.step)}</h1>
    )
  }
}
