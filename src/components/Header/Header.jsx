import React from 'react'

import './Header.scss'

import User from '../User/User'
import Toolbar from '../Toolbar/Toolbar'

const Header = ({isOpen}) => (
    <div className="header">
        <div className="container" >
            <Toolbar />
            <User isOpen={isOpen}/>
        </div>
    </div>
)

export default Header