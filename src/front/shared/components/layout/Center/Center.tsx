import React from 'react'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './Center.scss'

type CenterProps = {
  children: React.ReactNode
  relative?: boolean
  scrollable?: boolean
  keepFontSize?: boolean
  centerVertically?: boolean
  centerHorizontally?: boolean
}

const Center = ({
  children,
  scrollable = false,
  centerHorizontally = true,
  centerVertically = true,
  keepFontSize = false,
  relative = false,
  ...rest
}: CenterProps) => {
  // TODO move overflow to Modal and any other cases where it belongs
  const styleName = cx('centringContainer', {
    scrollable: scrollable,
    centerHorizontally: centerHorizontally,
    centerVertically: centerVertically,
    keepFontSize: keepFontSize,
    relative: relative,
  })

  return (
    <div styleName={styleName} {...rest}>
      <div styleName="centringContent">{children}</div>
    </div>
  )
}

export default cssModules(Center, styles, { allowMultiple: true })
