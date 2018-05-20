import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './WidthContainer.scss'


const WidthContainer = ({ children, className, fullHeight, relative, ...rest }) => {
  const containerStyleName = cx('widthContainer', {
    'fullHeight': fullHeight,
  })

  if (fullHeight || relative) {
    const containerInStyleName = cx('widthContainerIn', {
      'fullHeight': fullHeight,
      'relative': relative,
    })

    return (
      <div styleName={containerStyleName} className={className} {...rest}>
        <div styleName={containerInStyleName}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div styleName={containerStyleName} className={className} {...rest}>
      {children}
    </div>
  )
}

WidthContainer.propTypes = {
  children: PropTypes.node,
  fullHeight: PropTypes.bool,
  relative: PropTypes.bool,
  className: PropTypes.string,
}

export default cssModules(WidthContainer, styles, { allowMultiple: true })
