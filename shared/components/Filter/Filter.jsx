import React from 'react'
import PropTypes from 'prop-types'
import './Filter.scss'

import FilterLink from './FilterLink'

export default function Filter({ onSetFilter, activeFilter }) {
  return (
    <div className="history-filter">
      <FilterLink
        name="All"
        onClick={() => onSetFilter('ALL')}
        active={activeFilter === 'ALL'}
      />
      <FilterLink
        name="Sent"
        onClick={() => onSetFilter('SENT')}
        active={activeFilter === 'SENT'}
      />
      <FilterLink
        name="Received"
        onClick={() => onSetFilter('RECEIVED')}
        active={activeFilter === 'RECEIVED'}
      />
    </div>
  )
}

Filter.propTypes = {
  onSetFilter: PropTypes.func.isRequired,
  activeFilter: PropTypes.string.isRequired,
}

