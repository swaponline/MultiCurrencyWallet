import React, { Component } from 'react'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import { FormattedMessage } from 'react-intl'
import Button from 'components/controls/Button/Button'
import config from 'app-config'
import { constants, localStorage } from 'helpers'
import feedback from 'shared/helpers/feedback'


const isWidgetBuild = config && config.isWidget

export default class PreventMultiTabs extends Component<any, any> {
  constructor(props) {
    super(props)

    const preventSwitch = localStorage.getItem(
      constants.localStorage.preventSwitch
    )

    if (!preventSwitch) {
      // auto switch
      setTimeout(this.handleSwitchClick, 100)
    }
  }

  handleSwitchClick = () => {
    feedback.app.otherTabsClosed()
    const { onSwitchTab } = this.props

    localStorage.setItem(constants.localStorage.preventSwitch, 'whe-are-now-make-switch-tab')
    setTimeout(() => {
      localStorage.removeItem(constants.localStorage.preventSwitch)
    }, 5000)

    if (onSwitchTab instanceof Function) {
      onSwitchTab()
    }
  }

  render() {
    return (
      /*
      //@ts-ignore */
      <WidthContainer>
        <h1>
          <FormattedMessage
            id="PreventMultiTabs"
            defaultMessage="Such error, many tabs"
          />
        </h1>
        {isWidgetBuild && (
          <FormattedMessage
            id="PreventMultiTabsWidgetBuild"
            defaultMessage="{widgetName} supports only one active tab. Please close the other open window and refresh to continue."
            values={{ widgetName: window.widgetName || 'Atomic Swap Widget' }}
          />
        )}
        {!isWidgetBuild && (
          <FormattedMessage
            id="PreventMultiTabs12"
            defaultMessage="Our service Supports only one active tab. Please close the other open window and refresh to continue."
          />
        )}
        <br />
        <br />
        <Button brand fullWidth onClick={this.handleSwitchClick}>
          <FormattedMessage
            id="PreventMultiTabsSwitchApp"
            defaultMessage="Закрыть другие вкладки и продолжить тут"
          />
        </Button>
      </WidthContainer>
    )
  }
}
