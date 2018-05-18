import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Button.scss'

function Button({ back }) {
  return (
    <div styleName="confirm__buttons">
      <a href="#" styleName="confirm__back" onClick={back}>Back</a>
      <a href="#" styleName="confirm__submit" >Confirm</a>
    </div>
  )
}

Button.propTypes = {
  back: PropTypes.func.isRequired,
}

export default CSSModules(Button, styles)
