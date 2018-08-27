import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './EmergencySave.scss'


@CSSModules(styles)
export default class EmergencySave extends Component {

  static propTypes = {
    flow: PropTypes.object,
  }

  state = {
    isShowEmergency: false,
  }

  showEmergency = () => {
    this.setState({
      isShowEmergency: !this.state.isShowEmergency,
    })
  }

  render() {
    const { isShowEmergency } = this.state
    const { flow: { state } } = this.props

    return (
      <div styleName="block">
        <span styleName="button"  onClick={this.showEmergency}>
          Information about swap
        </span>
        {
          isShowEmergency && (
            <pre>
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
