import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Debug.scss'
import { FormattedMessage } from 'react-intl'

import ShowBtcScript from './ShowBtcScript'

@CSSModules(styles)
export default class Debug extends Component<any, any> {
  static propTypes = {
    flow: PropTypes.object,
  }

  render() {
    const {
      flow: {
        state: flowState,
        state: {
          // @ToDo - will be universaly after NextCoin integration
          btcScriptValues,
          ghostScriptValues,
          nextScriptValues,
        },
      },
    } = this.props

    const scriptValues = btcScriptValues || ghostScriptValues || nextScriptValues

    return (
      <div styleName="debug">
        <button styleName='button' onClick={() => document.location.href = '#/localStorage'}>
          <FormattedMessage id="DebugStoredDataLink" defaultMessage="Show stored data" />
        </button>
        <h5 styleName='title'>
          <FormattedMessage id="DebugSwapDataTitle" defaultMessage="Swap data:" />
        </h5>
        <pre styleName="information">
          <code>
            <ShowBtcScript btcScriptValues={scriptValues} />
          </code>
        </pre>
        <pre styleName="information">
          <code>{JSON.stringify(flowState, null, 4)}</code>
        </pre>
      </div>
    )
  }
}
