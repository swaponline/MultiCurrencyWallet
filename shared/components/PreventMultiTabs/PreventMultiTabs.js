import React, { Component } from 'react'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import { FormattedMessage } from 'react-intl'
import Button from 'components/controls/Button/Button'
import config from 'app-config'
import { getSiteData } from 'helpers'


const isWidgetBuild = config && config.isWidget

export default class PreventMultiTabs extends Component {

  constructor() {
    super()

    const { projectName } = getSiteData()
    this.state = {
      projectName,
    }
  }

  handleSwitchClick = () => {
    const { onSwitchTab } = this.props
    if (onSwitchTab instanceof Function) {
      onSwitchTab()
    }
  }

  render() {
    const { projectName } = this.state
    console.log(this.props)
    return (
      <WidthContainer>
        <h1>
          <FormattedMessage id="PreventMultiTabs" defaultMessage="Such error, many tabs" />
        </h1>
        {
          isWidgetBuild && (
            <FormattedMessage
              id="PreventMultiTabsWidgetBuild"
              defaultMessage="Atomic Swap Widget supports only one active tab. Please reload this page to continue using this tab or close it"
            />
          )
        }
        {
          !isWidgetBuild && (
            <FormattedMessage
              id="PreventMultiTabs45"
              defaultMessage="{project} supports only one active tab. Please reload this page to continue using this tab or close it"
              values={{
                project: projectName,
              }}
            />
          )
        }
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