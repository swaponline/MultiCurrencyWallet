import React, { Component } from 'react'

import styles from './NewWallet.scss'
import cssModules from 'react-css-modules'

import NewHeader from './NewHeader/NewHeader'
import Side from './Side/Side'
import CurrencySlider from './Components/CurrencySlider/CurrencySlider'
import PromoText from './Components/PromoText/PromoText'
import ExchangeBlock from './Components/SwapWindow/ExchangeBlock'


@cssModules(styles)
export default class NewWallet extends Component {
  render() {
    return (
      <div>
        <NewHeader />
        <Side />
        <PromoText />
        <CurrencySlider />
        <ExchangeBlock />
      </div>
    )
  }
}
