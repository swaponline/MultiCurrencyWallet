import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from 'components/controls/Button/Button'

export default class EmergencySave extends Component {

  static propTypes = {
    swap: PropTypes.any
  }

  state = {
    isShowEmergency: false
  }

  showEmergency = () => {
    const { isShowEmergency } = this.state

    this.setState({ isShowEmergency: !isShowEmergency })
  }

  render() {
    const { isShowEmergency } = this.state
    const { flow: { state } } = this.props.swap

    return (
      <div style={{ marginTop: '30%' }}>
        <Button brand onClick={this.showEmergency}>
          SHOW EMERGENCY INFORMATION
        </Button>
        {
          isShowEmergency && (
            <pre>
              <code className="code">
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
