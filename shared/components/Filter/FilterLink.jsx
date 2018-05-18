import React from 'react'
import PropTypes from 'prop-types'
import './Filter.scss'

export default function FilterLink({ name, active, onClick }) {

  function click(event) {
    event.preventDefault()
    onClick()
  }

  return (
    <a
      href=""
      className={active ? 'history-filter__item  history-filter__item_active' : 'history-filter__item'}
      onClick={click}
    >
      {name}
    </a>
  )
}

FilterLink.propTypes = {
  name: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
}

