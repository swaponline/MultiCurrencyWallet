import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'

import ReactTooltip from 'react-tooltip'
import styles from './Tooltip.scss'
import { FormattedMessage } from 'react-intl'


const Tooltip = ({ text, id }) => (
  <Fragment>
    <span data-tip data-for={id} styleName="tooltip">
      <FormattedMessage id="Tooltip11" defaultMessage="?" />
    </span>
    <ReactTooltip id={id} effect="solid" type="light" >
      <span>{text}</span>
    </ReactTooltip>
  </Fragment>
)

export default CSSModules(Tooltip, styles)
