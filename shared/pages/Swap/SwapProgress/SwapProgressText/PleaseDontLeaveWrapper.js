import React from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'

import Tooltip from 'components/ui/Tooltip/Tooltip'
import styles from '../SwapProgress.scss'


const PleaseDontLeaveWrapper = (props) => {
  const { children } = props
  return (
    <div>
      {children}
      <span styleName="stepHeading__inner">
        <FormattedMessage id="swapprogressDONTLEAVE" defaultMessage="Please do not leave this page " />
        <Tooltip
          id="swapjsdontleave"
          dontHideMobile
        >
          <FormattedMessage
            id="swapjsdontleave"
            defaultMessage="The exchange requires signing with private keys that only your browser knows." />
        </Tooltip>
      </span>
    </div>
  )
}

export default CSSModules(PleaseDontLeaveWrapper, styles, { allowMultiple: true })
