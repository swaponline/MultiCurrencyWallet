import React from 'react'
import cssModules from 'react-css-modules'
import { FormattedMessage } from 'react-intl'

import styles from './TurboIcon.scss'
import turboSwapIcon from 'shared/images/turbo.svg'
import Tooltip from 'shared/components/ui/Tooltip/Tooltip'


const TurboIcon = () => {
  return (
    <div styleName='turboIcon' id="ti">
      <img styleName='turboIconImage' src={turboSwapIcon} />
      <span styleName='turboIconText'>turbo</span>
      {/* @ts-ignore: strictNullChecks */}
      <Tooltip id="test" mark={false} place={'bottom'}>
        <FormattedMessage id="TurboIcon_Tip" defaultMessage="Faster and cheaper swap with trusted marketmaker, recommended for small amounts" />
      </Tooltip>
    </div>
  )
}

export default cssModules(TurboIcon, styles, { allowMultiple: true })
