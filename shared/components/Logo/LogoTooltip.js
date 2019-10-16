import React, { Fragment } from 'react'

import Logo from './Logo'

import ReactTooltip from 'react-tooltip'
import { FormattedMessage, injectIntl } from 'react-intl'


const LogoTooltip = (props) => (
  <Fragment>
    <Logo withLink isColored={props.isColored} isExchange={props.isExchange} />
    <ReactTooltip id="logo" type="light" effect="solid">
      <FormattedMessage id="logo29" defaultMessage="Go Home" />
    </ReactTooltip>
  </Fragment>
)
export default LogoTooltip
