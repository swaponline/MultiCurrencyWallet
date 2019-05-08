import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './IframeWidget.scss'

import CloseIcon from 'components/ui/CloseIcon/CloseIcon'


const IframeWidget = ({ onClick }) => (
  <div>
    <CloseIcon styleName="close" onClick={onClick} />
    <section styleName="section">
      <iframe width="90%" height="750px" styleName="mainBody" title="widget" src="https://widget.swap.online/" frameBorder="0" />
    </section>
  </div>
)

export default CSSModules(IframeWidget, styles)
