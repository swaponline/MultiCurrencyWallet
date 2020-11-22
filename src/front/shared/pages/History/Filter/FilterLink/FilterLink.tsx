import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './FilterLink.scss'


const FilterLink = ({ name, filter, onClick }) => (
  <span
    styleName={filter === name.toLowerCase() ? 'item  active' : 'item'}
    onClick={onClick}
  >
    {name}
  </span>
)

FilterLink.propTypes = {
  name: PropTypes.string.isRequired,
  filter: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
}

export default CSSModules(FilterLink, styles, { allowMultiple: true })
