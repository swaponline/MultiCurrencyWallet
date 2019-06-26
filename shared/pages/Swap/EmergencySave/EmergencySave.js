import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './EmergencySave.scss'
import { FormattedMessage } from 'react-intl'


@CSSModules(styles)
export default class EmergencySave extends Component {

  static propTypes = {
    flow: PropTypes.object,
  }


  render() {
    const { flow: { state }, onClick, isShowDevInformation } = this.props

    return (
      <div styleName="block">
        <span styleName="button"  onClick={onClick}>
          <FormattedMessage id="EmergencySave33" defaultMessage="Debug" />
        </span>
        {
          isShowDevInformation && (
            <pre styleName="information">
              <code>
                {
                  JSON.stringify(state, false, 4)
                }
              </code>
            </pre>
          )
        }
      </div>
    )
  }

}
