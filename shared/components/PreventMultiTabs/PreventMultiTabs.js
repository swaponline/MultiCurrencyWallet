import React from 'react'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import { FormattedMessage } from 'react-intl'


const PreventMultiTabs = () => (
  <WidthContainer>
    <FormattedMessage id="PreventMultiTabs" defaultMessage="Such error, many tabs">
      {message => <h1>{message}</h1>}
    </FormattedMessage>
    Swap.Online supports only one active tab.
    Please reload this page to continue using this tab or close it.
  </WidthContainer>
)

export default PreventMultiTabs
