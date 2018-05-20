import React from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'

import CSSModules from 'react-css-modules'
import styles from './Open.scss'

function Open({ isOpen, open, name }) {
  return (
    <div
      className="users"
      onClick={isOpen}
      onMouseUp={() => actions.notification.update(name, false)}>
      <div styleName="users__user">
        <span styleName="users__user-letter">K</span>
        { open === true ?
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

