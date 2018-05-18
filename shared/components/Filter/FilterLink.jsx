import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Filter.scss'

function FilterLink({ name, active, onClick }) {

  function click(event) {
    event.preventDefault()
    onClick()
  }

  return (
    <a
      href=""
      styleName={active ? 'history-filter__item  history-filter__item_active' : 'history-filter__item'}
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

export default CSSModules(FilterLink, styles, { allowMultiple: true })

