import React from 'react'
import PropTypes from 'prop-types'

import cssModules from 'react-css-modules'
import styles from './Overlay.scss'


const Overlay = ({ children, onClick, dashboardView }) => {
  let [evaluatedHeight, setEvaluatedHeight] = React.useState(400)
  React.useEffect(() => {
    if (dashboardView) {
      const elWithHeight = document.querySelector('.__modalConductorProvided__ .contentHeightEvaluateHere')
      setEvaluatedHeight(elWithHeight.clientHeight ||
        elWithHeight.offsetHeight ||
        400)
    }
  })

  return (
    <div styleName={dashboardView ? 'overlayDashboardView' : 'overlay'} onClick={onClick} style={dashboardView ? { minHeight: `${evaluatedHeight + 88}px` } : {}}>
      {children}
    </div>
  )
}

Overlay.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
}

export default cssModules(Overlay, styles)
