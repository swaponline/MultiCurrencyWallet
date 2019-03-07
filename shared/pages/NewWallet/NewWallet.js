import React, { Component } from 'react'

import styles from './NewWallet.scss'
import cssModules from 'react-css-modules'

import Side from './Components/Side/Side'
import Promo from './Components/Promo/Promo'

@cssModules(styles)
export default class NewWallet extends Component {
  render() {
    return (
      <div styleName="container">
        <Promo />
        <Side />
      </div>
    )
  }
}
