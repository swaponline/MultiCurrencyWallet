import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './Description.scss'

import FilterContainer from '../../containers/FilterContainer'

function Description({ title, subtitle, filter = false  }) {
  return (
    <div styleName="description">
      <div styleName="container">
        { title !== '' ? <h2 styleName="description__title">{title}</h2> : '' }
        <h3 styleName="description__sub-title">{subtitle}</h3>
        {filter ? <FilterContainer /> : ''}
      </div>
    </div>
  )
}

Description.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string.isRequired,
  filter: PropTypes.bool,
}

export default CSSModules(Description, styles)

