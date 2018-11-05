import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'

import ReactTooltip from 'react-tooltip'
import styles from './Tooltip.scss'
import { FormattedMessage } from 'react-intl'


const Tooltip = ({ text }) => (
  <Fragment>
    <span data-tip={text} styleName="tooltip">
      <FormattedMessage id="Tooltip11" defaultMessage="?" />
    </span>
    <ReactTooltip effect="solid" type="light" />
  </Fragment>
)

export default CSSModules(Tooltip, styles)
