import React, { Component } from 'react'

import styles from './NewHeader.scss'
import cssModules from 'react-css-modules'
import Logo from 'components/Logo/Logo'
import Menu from '../Menu/Menu'


@cssModules(styles)
export default class NewHeader extends Component {
  render() {
    return (
      <div>
        <div styleName="logoWrap">
          <Logo />
        </div>
        <Menu />
      </div>
    )
  }
}
