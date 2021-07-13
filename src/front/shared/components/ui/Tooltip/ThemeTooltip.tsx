import React from "react"
import ReactTooltop from "react-tooltip"

// A react tooltip wrapper to define a tooltip type depending on the theme
export default function ThemeTooltip(params) {
  const { type, children, ...props } = params
  const isDark = document.body.dataset.scheme === 'dark'
  const defaultType = isDark ? "light" : "dark"

  return (
    <ReactTooltop type={type || defaultType} {...props}>
      {children}
    </ReactTooltop>
  )
}
