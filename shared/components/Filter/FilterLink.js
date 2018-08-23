import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Filter.scss'


const FilterLink = ({ name, filter, onClick }) => (
  <span
    styleName={filter === name.toLowerCase() ? 'history-filter__item  history-filter__item_active' : 'history-filter__item'}
    onClick={onClick}
  >
    {name}
  </span>
)

FilterLink.propTypes = {
  name: PropTypes.string.isRequired,
  filter: PropTypes.string.isRequired,
}

export default CSSModules(FilterLink, styles, { allowMultiple: true })
