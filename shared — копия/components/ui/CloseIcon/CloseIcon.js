import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import cssModules from 'react-css-modules'
import styles from './CloseIcon.scss'


const CloseIcon = ({ whiteColor, brandColor, ...rest }) => {
  const styleName = cx('button', {
    'whiteColor': whiteColor,
    'brandColor': brandColor,
  })

  return (
    <div styleName={styleName} {...rest} role="closeButton">
      <div styleName="icon" role="closeIcon" />
    </div>
  )
}

CloseIcon.propTypes = {
  whiteColor: PropTypes.bool,
  brandColor: PropTypes.bool,
}


export default cssModules(CloseIcon, styles, { allowMultiple: true })
