import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import { FormattedMessage } from 'react-intl'

import BtcScript from './BtcScript'


@CSSModules(styles)
export default class ShowBtcScript extends Component {
  render() {
    const { btcScriptValues } = this.props
    return (
      <BtcScript
        secretHash={btcScriptValues.secretHash}
        recipientPublicKey={btcScriptValues.recipientPublicKey}
        lockTime={btcScriptValues.lockTime}
        ownerPublicKey={btcScriptValues.ownerPublicKey}
      />
    )
  }
}
