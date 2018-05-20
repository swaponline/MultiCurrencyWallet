import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Title.scss'


function Title({ name }) {
  return (
    <div styleName="title">
      <span>{name}</span>
      <span
        styleName="question"
        data-toggle="tooltip"
        data-placement="top"
        title="Enter the amount and the address. Transfer your coins and let the magic happen."
      >
          ?
      </span>
    </div>
  )
}

Title.propTypes = {
  name: PropTypes.string.isRequired,
}

export default CSSModules(Title, styles)
