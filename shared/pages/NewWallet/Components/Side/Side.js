import React, { Component } from 'react'


import styles from './Side.scss'
import cssModules from 'react-css-modules'

import NewHeader from '../NewHeader/NewHeader'
import ButtonEnter from '../Buttons/ButtonEnter/ButtonEnter'
import ButtonCreate from '../Buttons/ButtonCreate/ButtonCreate'


@cssModules(styles)
export default class NewContent extends Component {
  render() {
    return (
      <div styleName="side">
        <div styleName="buttonsWrap">
          <ButtonEnter onClick={() => console.log('asd')}>
            Enter to wallet
          </ButtonEnter>
          <ButtonCreate onClick={() => console.log('asd')}>
            Create new wallet
          </ButtonCreate>
        </div>
      </div>
    )
  }
}
