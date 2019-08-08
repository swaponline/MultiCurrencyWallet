import React, { Component } from 'react'

import styles from '../SwapProgress.scss'
import CSSModules from 'react-css-modules'

import { FormattedMessage } from 'react-intl'


const BtcToQtum = (props) => {
  const btcToQtum = (step) => {

    switch (step) {
      case 1:
        return (
          <FormattedMessage id="btcQtumStep1" defaultMessage="The order creator is offline. Waiting for him.." />
        )
      case 2:
        return (
          <FormattedMessage id="btcQtumStep2" defaultMessage="Create a secret key" />
        )
      case 3:
        return (
          <FormattedMessage id="btcQtumStep3" defaultMessage="Checking balance.." />
        )
      case 4:
        return (
          <FormattedMessage id="btcQtumSte4" defaultMessage="Creating Bitcoin Script.{br}It can take a few minutes" values={{ br: <br /> }} />
        )
      case 5:
        return ( // eslint-disable-next-line
          <FormattedMessage id="btcQtumStep5" defaultMessage="Your BTC are now depositing. It may require one confirmation from Bitcoin Network. Waiting for other participant to deposit QTUM." />
        )
      case 6:
        return (
          <FormattedMessage id="btcQtumStep6" defaultMessage="QTUM Contract created and charged. Requesting withdrawal from QTUM Contract." />
        )
      case 7:
        return  (
          <FormattedMessage id="btcQtumStep7" defaultMessage="QTUM was transferred to your wallet. Check the balance." />
        )
      case 8:
        return (
          <FormattedMessage id="btcQtumStep8" defaultMessage="Thank you for using Swap.Onlinde!" />
        )
      default:
        return null
    }
  }

  return btcToQtum(props.step)
}

export default CSSModules(BtcToQtum, styles, { allowMultiple: true })
