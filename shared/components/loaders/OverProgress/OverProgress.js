import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './OverProgress.scss'


const OverProgress = ({ overlayClassName, className, progress, text }) => (
  <div styleName="overlay" className={overlayClassName}>
    <span styleName="text">step {text}</span>
    <div styleName="circle" data-progress={progress}>
      <div>
        <div styleName="full slice">
          <div styleName="fill" />
        </div>
        <div styleName="slice">
          <div styleName="fill" />
          <div styleName="fill bar" />
        </div>
      </div>
      <div styleName="overlay" />
    </div>
  </div>
)


export default CSSModules(OverProgress, styles, { allowMultiple: true })
