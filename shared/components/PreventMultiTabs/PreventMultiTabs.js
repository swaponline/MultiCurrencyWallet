import React from 'react'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import { FormattedMessage } from 'react-intl'
import Button from 'components/controls/Button/Button'
import config from 'app-config'


const isWidgetBuild = config && config.isWidget

const handleSwitchApp = () => {
  console.log('swith app tab')
}

const PreventMultiTabs = () => (
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
          id="PreventMultiTabs12"
          defaultMessage="Swap.Online supports only one active tab. Please reload this page to continue using this tab or close it"
        />
      )
    }
    <Button brand fullWidth onClick={handleSwitchApp}>
      <FormattedMessage
        id="PreventMultiTabsSwitchApp"
        defaultMessage="Закрыть другие вкладки и продолжить тут"
      />
    </Button>
  </WidthContainer>
)
export default PreventMultiTabs
