import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Switching.scss'
import cx from 'classnames'

import PropTypes from 'prop-types'


const Switching = ({ onClick, noneBorder }) => {

  const styleName = cx('Switching', {
    'noneBorder': noneBorder,
  })

  return (
    <button onClick={onClick} styleName={styleName} />
  )
}

Switching.propTypes = {
  onClick: PropTypes.func.isRequired,
}

export default CSSModules(Switching, styles, { allowMultiple: true })
