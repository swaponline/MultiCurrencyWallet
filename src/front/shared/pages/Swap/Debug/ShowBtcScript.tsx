import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import { FormattedMessage } from 'react-intl'

import BtcScript from './BtcScript'


@CSSModules(styles)
export default class ShowBtcScript extends Component<any, any> {
  render() {
    const { utxoScriptValues } = this.props
    if (!utxoScriptValues) return null
    return (
      <BtcScript
        secretHash={utxoScriptValues.secretHash}
        recipientPublicKey={utxoScriptValues.recipientPublicKey}
        lockTime={utxoScriptValues.lockTime}
        ownerPublicKey={utxoScriptValues.ownerPublicKey}
      />
    )
  }
}
