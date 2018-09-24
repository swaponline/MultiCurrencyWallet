import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './Center.scss'


const Center = ({ children, scrollable, keepFontSize, ...rest }) => {
  // TODO move overflow to Modal and any other cases where it belongs
  const styleName = cx('centringContainer', {
    'scrollable': scrollable,
    'keepFontSize': keepFontSize,
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
  children: PropTypes.node,
  scrollable: PropTypes.bool,
  keepFontSize: PropTypes.bool,
}

Center.defaultProps = {
  scrollable: false,
  keepFontSize: false,
}


export default cssModules(Center, styles, { allowMultiple: true })
