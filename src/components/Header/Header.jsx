import React from 'react'

import './Header.scss'

import User from '../User/User'
import Toolbar from '../Toolbar/Toolbar'

const Header = () => (
    <div className="header">
        <div className="container" >
            <Toolbar />
            <User />
        </div>
    </div>
)

export default Header