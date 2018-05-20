import React, { Component } from 'react'
import PropTypes from 'prop-types'
import actions from 'redux/actions'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './Filter.scss'

import FilterLink from './FilterLink'


@connect({
  'activeFilter': 'history.filter',
})
@CSSModules(styles)
export default class Filter extends Component {
  render() {
    const { activeFilter } = this.props
    return (
      <div styleName="history-filter">
        <FilterLink
          name="All"
          onClick={() => actions.filter.setFilter('ALL')}
          active={activeFilter === 'ALL'}
        />
        <FilterLink
          name="Sent"
          onClick={() => actions.filter.setFilter('SENT')}
          active={activeFilter === 'SENT'}
        />
        <FilterLink
          name="Received"
          onClick={() => actions.filter.setFilter('RECEIVED')}
          active={activeFilter === 'RECEIVED'}
        />
      </div>
    )
  }
}

Filter.propTypes = {
  activeFilter: PropTypes.string,
}
