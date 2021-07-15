import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './Debug.scss'
import { FormattedMessage } from 'react-intl'
import ShowBtcScript from './ShowBtcScript'

type ComponentProps = {
  flow: IUniversalObj
}

@CSSModules(styles, { allowMultiple: true })
export default class Debug extends Component<ComponentProps, any> {
  render() {
    const {
      flow: {
        state: flowState,
        state: {
          utxoScriptValues: scriptValues,
        },
      },
    } = this.props

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
