import React from 'react'
import PropTypes from 'prop-types'
import './Open.scss'

export default function Open({ open, notification = false, isUpdate }) {
  return (
    <div
      className="users"
      onClick={open}
      onMouseUp={() => isUpdate('', false)}>
      <div className="users__user">
        <span className="users__user-letter">K</span>
        { notification === true ?
          <span className="users__user-status" />  : ''}
      </div>
    </div>
  )
}

Open.propTypes = {
  open: PropTypes.func.isRequired,
  notification: PropTypes.bool.isRequired,
  isUpdate: PropTypes.func.isRequired,
}

