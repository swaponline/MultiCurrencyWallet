import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './PageHeadline.scss'

import Filter from '../Filter/Filter'


const PageHeadline = ({ title, subtitle, filter = false }) => (
  <div styleName="description">
    {
      title && (
        <h2 styleName="description__title">{title}</h2>
      )
    }
    <h3 styleName="description__sub-title">{subtitle}</h3>
    {
      filter && (
        <Filter />
      )
    }
  </div>
)

PageHeadline.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string.isRequired,
  filter: PropTypes.bool,
}

export default CSSModules(PageHeadline, styles)
