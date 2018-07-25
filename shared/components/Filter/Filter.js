import React, { Component } from 'react'
import PropTypes from 'prop-types'

import actions from 'redux/actions'
import { connect } from 'redaction'

import CSSModules from 'react-css-modules'
import styles from './Filter.scss'

import FilterLink from './FilterLink'


@connect(({ history: { filter } }) => ({
  filter,
}))
@CSSModules(styles)
export default class Filter extends Component {

  static propTypes = {
    filter: PropTypes.string,
  }

  handleChangeFilter = (filter) => {
    actions.filter.setFilter(filter)
    actions.analytics.dataEvent(`history-click-${filter}`)
  }

  render() {
    const { filter } = this.props

    return (
      <div styleName="history-filter">
        <FilterLink
          name="All"
          onClick={() => this.handleChangeFilter('all')}
          filter={filter}
        />
        <FilterLink
          name="Sent"
          onClick={() => this.handleChangeFilter('sent')}
          filter={filter}
        />
        <FilterLink
          name="Received"
          onClick={() => this.handleChangeFilter('received')}
          filter={filter}
        />
      </div>
    )
  }
}
