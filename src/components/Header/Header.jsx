import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import User from '../User/User'
import Toolbar from '../Toolbar/Toolbar'

const Header = ({isOpen}) => (
    <div styleName="header">
        <div className="container" >
            <Toolbar />
            <User isOpen={isOpen}/>
        </div>
    </div>
)

export default CSSModules(Header, styles)