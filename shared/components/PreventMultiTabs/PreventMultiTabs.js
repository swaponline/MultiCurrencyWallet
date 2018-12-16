import React from 'react'

import WidthContainer from 'components/layout/WidthContainer/WidthContainer'
import { FormattedMessage } from 'react-intl'

/* eslint-disable */
const PreventMultiTabs = () => (
  <WidthContainer>
    <h1>
      <FormattedMessage id="PreventMultiTabs" defaultMessage="Such error, many tabs" />
    </h1>
    <FormattedMessage
      id="PreventMultiTabs12"
      defaultMessage="Swap.Online supports only one active tab. Please reload this page to continue using this tab or close it"
    />
  </WidthContainer>
)
/* eslint-disable */
export default PreventMultiTabs
