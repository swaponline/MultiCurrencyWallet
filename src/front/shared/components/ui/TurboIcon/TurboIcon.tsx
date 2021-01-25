import React from 'react'

import cssModules from 'react-css-modules'
import styles from './TurboIcon.scss'
import turboSwapIcon from 'shared/images/turbo.svg'


const TurboIcon = () => {
  return (
    <div styleName='turboIcon'>
      <img src={turboSwapIcon} />
      <span>turbo</span>
    </div>
  )
}

export default cssModules(TurboIcon, styles, { allowMultiple: true })
