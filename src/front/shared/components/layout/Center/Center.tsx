import React from 'react'
import cx from 'classnames'
import cssModules from 'react-css-modules'
import styles from './Center.scss'

interface CenterProps {
  children: React.ReactNode,
  scrollable: boolean,
  centerVertically: boolean,
  centerHorizontally: boolean,
  keepFontSize: boolean,
  relative: boolean
}

const Center = ({ children, scrollable, centerHorizontally, centerVertically, keepFontSize, relative, ...rest }: CenterProps) => {
  // TODO move overflow to Modal and any other cases where it belongs
  const styleName = cx('centringContainer', {
    scrollable,
    centerHorizontally,
    centerVertically,
    keepFontSize,
    relative
  })

  return (
    <div styleName={styleName} {...rest}>
      <div styleName="centringContent">
        {children}
      </div>
    </div>
  )
}

Center.defaultProps = {
  children: null,
  scrollable: false,
  centerVertically: true,
  centerHorizontally: true,
  keepFontSize: false,
  relative: false
}


export default cssModules(Center, styles, { allowMultiple: true })
