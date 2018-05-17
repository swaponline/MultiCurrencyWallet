import React from 'react'
import './Header.scss'

import UserContainer from '../../containers/UserContainers'
import Toolbar from '../Toolbar/Toolbar'

const Header = () => (
  <div className="header">
    <div className="container" >
      <Toolbar />
      <UserContainer />
    </div>
  </div>
)

export default Header
