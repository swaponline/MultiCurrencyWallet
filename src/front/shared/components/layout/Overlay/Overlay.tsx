import React, { useEffect } from 'react'
import cssModules from 'react-css-modules'
import styles from './Overlay.scss'

type ComponentProps = {
  children: JSX.Element | JSX.Element[]
  onClick?: () => void
  dashboardView?: boolean
}

function Overlay(props: ComponentProps) {
  const {
    children,
    onClick = () => undefined,
    dashboardView = false,
  } = props

  const [evaluatedHeight, setEvaluatedHeight] = React.useState(400)

  useEffect(() => {
    if (dashboardView) {
      const elWithHeight: HTMLElement | null = document.querySelector('.__modalConductorProvided__ .contentHeightEvaluateHere')

      if (elWithHeight) {
        setEvaluatedHeight(elWithHeight.clientHeight
          || elWithHeight.offsetHeight
          || 400)
      }
    }
  })

  return (
    <div styleName={dashboardView ? 'overlayDashboardView' : 'overlay'} onClick={onClick} style={dashboardView ? { minHeight: `${evaluatedHeight + 88}px` } : {}}>
      {children}
    </div>
  )
}

export default cssModules(Overlay, styles)
