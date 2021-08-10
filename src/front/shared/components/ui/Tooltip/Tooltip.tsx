import React, { Fragment } from 'react'
import CSSModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'
import ThemeTooltip from './ThemeTooltip'
import styles from './Tooltip.scss'

type ComponentProps = {
  mark?: boolean
  id: string
  children: JSX.Element[] | JSX.Element | string
  dontHideMobile?: boolean
  place?: null | string
}

const Tooltip = (props: ComponentProps) => {
  const { mark = true, children, id, dontHideMobile = false, place = null } = props

  return (
    <Fragment>
      {mark ? (
        <span
          data-tip
          data-for={id}
          styleName={`tooltip isMark ${dontHideMobile ? 'tooltip_truesight' : ''}`}
        >
          <FormattedMessage id="Tooltip11" defaultMessage="?" />
        </span>
      ) : (
        <div data-tip data-for={id} styleName="tooltip noMark"></div>
      )}

      <ThemeTooltip styleName="r-tooltip" id={id} effect="solid" multiline {...{ place }}>
        {children}
      </ThemeTooltip>
    </Fragment>
  )
}

export default CSSModules(Tooltip, styles, { allowMultiple: true })
