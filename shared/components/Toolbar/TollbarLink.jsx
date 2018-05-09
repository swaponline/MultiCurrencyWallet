import React from 'react'
import { NavLink } from 'react-router-dom'

import './Toolbar.scss'

const ToolbarLink = ({ name, ...rest }) => (
    <NavLink className="trades-filter__link"
        activeClassName="trades-filter__link-active" {...rest}>
        { name }
    </NavLink>
) 

export default ToolbarLink