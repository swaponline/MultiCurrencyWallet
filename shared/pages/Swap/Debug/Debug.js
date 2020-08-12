import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Debug.scss'
import { FormattedMessage } from 'react-intl'

import ShowBtcScript from './ShowBtcScript'

@CSSModules(styles)
export default class Debug extends Component {

  static propTypes = {
    flow: PropTypes.object,
  }


  render() {
    const { flow: { state } } = this.props

    return (
      <div styleName="debug">
        <pre styleName="information">
          <code>
            <ShowBtcScript btcScriptValues={state.btcScriptValues} />
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
