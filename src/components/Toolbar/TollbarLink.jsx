import React from 'react'
import { NavLink } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './Toolbar.scss'

const ToolbarLink = ({ name, ...rest }) => (
    <NavLink styleName="trades-filter__link" 
        activeClassName={styles.tradesFilterlinkActive} {...rest}>
        { name }
    </NavLink>
) 

export default CSSModules(ToolbarLink, styles)