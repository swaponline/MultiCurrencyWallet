import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

import './Toolbar.scss'

const ToolbarLink = ({ name, ...rest }) => (
    <NavLink className="trades-filter__link"
        activeClassName="trades-filter__link-active" {...rest}>
        { name }
    </NavLink>
) 

ToolbarLink.propTypes = {
    name: PropTypes.string.isRequired,
}

export default ToolbarLink