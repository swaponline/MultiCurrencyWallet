import React from 'react'
import PropTypes from 'prop-types'

import CSSModules from 'react-css-modules'
import styles from './PromoText.scss'


const PromoText = ({ className }) => (
  <h3 styleName="promoText">
    <span styleName="promoTextColored">Swap.Online</span>
    <br />Your online cryptocurrency wallet
  </h3>
)

export default CSSModules(PromoText, styles)
