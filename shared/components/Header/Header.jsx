import React from 'react'

import CSSModules from 'react-css-modules'
import styles from './Header.scss'

import UserContainer from '../../containers/UserContainers'
import Toolbar from '../Toolbar/Toolbar'

@CSSModules(styles)
export default class Header extends React.Component {
  render() {
    return (
      <div styleName="header">
        <div styleName="container" >
          <Toolbar />
          <UserContainer />
        </div>
      </div>
    )
  }
}
