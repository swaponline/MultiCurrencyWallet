import React from 'react'
import { NavLink } from 'react-router-dom'

import CSSModules from 'react-css-modules'
import styles from './Toolbar.scss'

function ToolbarLink(props) {
    return(
        <NavLink styleName="trades-filter__link" 
            activeClassName={styles.tradesFilterlinkActive} {...props}>
            { props.name }
        </NavLink>
    ) 
}

export default CSSModules(ToolbarLink, styles)