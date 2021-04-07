import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { constants } from 'helpers'

const isDark = localStorage.getItem(constants.localStorage.isDark)

type RemoveButtonProps = {
  onClick: () => void
  brand?: boolean
}

const RemoveButton = (props: RemoveButtonProps) => {
  const { brand = false, onClick } = props

  return (
    <button
      styleName={`removeButton ${isDark ? 'dark' : ''} ${brand ? 'brand' : ''}`}
      onClick={onClick}
    />
  )
}

export default CSSModules(RemoveButton, styles, { allowMultiple: true })
