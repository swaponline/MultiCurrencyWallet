import React, { Component } from 'react'

import styles from './NewHeader.scss'
import cssModules from 'react-css-modules'
import Logo from 'components/Logo/Logo'
import ButtonEnter from '../Buttons/ButtonEnter/ButtonEnter'
import ButtonCreate from '../Buttons/ButtonCreate/ButtonCreate'

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
        <ButtonEnter onClick={() => console.log('asd')}>
          Enter to wallet
        </ButtonEnter>
        <ButtonCreate onClick={() => console.log('asd')}>
          Create new wallet
        </ButtonCreate>
      </div>
    )
  }
}
