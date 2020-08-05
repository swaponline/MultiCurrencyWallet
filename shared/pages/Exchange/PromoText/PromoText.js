import React from 'react'
import PropTypes from 'prop-types'

import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './PromoText.scss'


const PromoText = ({ className, subTitle }) => (
  <h3 styleName="promoText">
    {subTitle}
  </h3>
)

export default CSSModules(PromoText, styles)
