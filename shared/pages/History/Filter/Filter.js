import React from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions/index'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './Filter.scss'

import FilterLink from './FilterLink/FilterLink'
import { FormattedMessage } from 'react-intl'


const filters = [
  <FormattedMessage id="filter14" defaultMessage="All" />,
  <FormattedMessage id="filter15" defaultMessage="Sent" />,
  <FormattedMessage id="filter16" defaultMessage="Received" />
]

const Filter = ({ filter }) => {

  const handleChangeFilter = (filter) => {
    actions.filter.setFilter(filter)
    actions.analytics.dataEvent(`history-click-${filter}`)
  }

  return (
    <div styleName="filter">
      {
        filters.map(item => (
          <FilterLink
            key={item}
            name={item}
            onClick={() => handleChangeFilter(item.toLowerCase())}
            filter={filter}
          />
        ))
      }
    </div>
  )
}

Filter.propTypes = {
  filter: PropTypes.string.isRequired,
}

export default connect(({ history: { filter } }) => ({
  filter,
}))(CSSModules(Filter, styles))
