import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './Center.scss'


const Center = ({ children, scrollable, centerHorizontally, centerVertically, keepFontSize, relative, ...rest }) => {
  // TODO move overflow to Modal and any other cases where it belongs
  const styleName = cx('centringContainer', {
    'scrollable': scrollable,
    'centerHorizontally': centerHorizontally,
    'centerVertically': centerVertically,
    'keepFontSize': keepFontSize,
    'relative': relative,
  })

  return (
    <div styleName={styleName} {...rest}>
      <div styleName="centringContent">
        {children}
      </div>
    </div>
  )
}

Center.propTypes = {
  relative: PropTypes.bool,
  children: PropTypes.node,
  scrollable: PropTypes.bool,
  keepFontSize: PropTypes.bool,
  centerVertically: PropTypes.bool,
  centerHorizontally: PropTypes.bool,
}

Center.defaultProps = {
  relative: false,
  scrollable: false,
  keepFontSize: false,
  centerVertically: true,
  centerHorizontally: true,
}


export default cssModules(Center, styles, { allowMultiple: true })
