import React, { useMemo } from 'react'

import cssModules from 'react-css-modules'
import { constants } from 'helpers'

import styles from './Wrapper.scss'


const Wrapper = ({ children }) => {
  const isDark = useMemo(() => localStorage.getItem(constants.localStorage.isDark), [constants.localStorage.isDark])

  return (
    <div styleName={`Wrapper ${isDark ? '--dark' : ''}`}>
      {children}
    </div>
  )
}

export default cssModules(Wrapper, styles, { allowMultiple: true })
