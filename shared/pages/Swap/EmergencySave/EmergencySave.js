import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './EmergencySave.scss'

import Button from 'components/controls/Button/Button'


@CSSModules(styles)
export default class EmergencySave extends Component {

  static propTypes = {
    flow: PropTypes.object,
  }

  state = {
    isShowEmergency: false,
  }

  showEmergency = () => {
    this.setState(isShowEmergency => !isShowEmergency)
  }

  render() {
    const { isShowEmergency } = this.state
    const { flow: { state } } = this.props

    return (
      <div styleName="block">
        <Button brand onClick={this.showEmergency}>
          SHOW EMERGENCY INFORMATION
        </Button>
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
