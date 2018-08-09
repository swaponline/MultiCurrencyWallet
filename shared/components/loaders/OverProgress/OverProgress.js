import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './OverProgress.scss'


const OverProgress = ({ overlayClassName, className, progress, text }) => (
  <div styleName="overlay" className={overlayClassName}>
      <span styleName="text">step {text}</span>
      <div styleName="ko-progress-circle" data-progress={progress}>
          <div>
              <div styleName="full ko-progress-circle__slice">
                  <div styleName="ko-progress-circle__fill"></div>
              </div>
              <div styleName="ko-progress-circle__slice">
                  <div styleName="ko-progress-circle__fill"></div>
                  <div styleName="ko-progress-circle__fill ko-progress-circle__bar"></div>
              </div>
          </div>
          <div styleName="ko-progress-circle__overlay"></div>
      </div>
  </div>
)


export default CSSModules(OverProgress, styles, { allowMultiple: true })
