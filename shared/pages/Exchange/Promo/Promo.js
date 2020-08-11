import React from 'react'
import PropTypes from 'prop-types'

import CurrencySlider from '../CurrencySlider/CurrencySlider'
import PromoText from '../PromoText/PromoText'

import CSSModules from 'react-css-modules'
import styles from './Promo.scss'


const Promo = ({ className, subTitle }) => (
  <div styleName="promo">
    <div styleName="promoWrap">
      <PromoText subTitle={subTitle} />
      {/*<CurrencySlider />*/}
    </div>
  </div>
)

export default CSSModules(Promo, styles)
