import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Open.scss'

function Open({ open, notification = false, isUpdate }) {
  return (
    <div
      className="users"
      onClick={open}
      onMouseUp={() => isUpdate('', false)}>
      <div styleName="users__user">
        <span styleName="users__user-letter">K</span>
        { notification === true ?
          <span styleName="users__user-status" />  : ''}
      </div>
    </div>
  )
}

// Open.propTypes = {
//   open: PropTypes.func.isRequired,
//   notification: PropTypes.bool.isRequired,
//   isUpdate: PropTypes.func.isRequired,
// }

export default CSSModules(Open, styles)

