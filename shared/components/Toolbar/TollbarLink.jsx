import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './Toolbar.scss'

function ToolbarLink({ name, ...rest }) {
  return (
    <NavLink
      styleName="trades-filter__link"
      activeClassName={styles.tradesfilterlinkactive}
      {...rest}>
      {name}
    </NavLink>
  )
}

ToolbarLink.propTypes = {
  name: PropTypes.string.isRequired,
}

export default CSSModules(ToolbarLink, styles)
