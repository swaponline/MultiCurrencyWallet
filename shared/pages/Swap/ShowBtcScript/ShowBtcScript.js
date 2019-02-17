import React, { Component } from 'react'

import CSSModules from 'react-css-modules'
import styles from '../Swap.scss'

import { FormattedMessage } from 'react-intl'

import BtcScript from '../BtcScript/BtcScript'


@CSSModules(styles, { allowMultiple: true })
export default class ShowBtcScript extends Component {
  render() {
    const { btcScriptValues, isShowingBitcoinScript, onClick } = this.props
    return (
      <div>
        { btcScriptValues &&
          <div styleName={isShowingBitcoinScript ? "bitcoinScript" : "bitcoinScript unClicked"}>
            <span onClick={onClick}>
              <FormattedMessage id="swapJS341" defaultMessage="Show bitcoin script" />
            </span>
          </div>
        }
        {isShowingBitcoinScript &&
          <BtcScript
            secretHash={btcScriptValues.secretHash}
            recipientPublicKey={btcScriptValues.recipientPublicKey}
            lockTime={btcScriptValues.lockTime}
            ownerPublicKey={btcScriptValues.ownerPublicKey}
          />
        }
      </div>
    )
  }
}
