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
        <pre styleName="information">
          <code>
            <ShowBtcScript btcScriptValues={scriptValues} />
          </code>
        </pre>
        <pre styleName="information">
          <code>
            { JSON.stringify(state, false, 4) }
          </code>
        </pre>
      </div>
    )
  }

}
