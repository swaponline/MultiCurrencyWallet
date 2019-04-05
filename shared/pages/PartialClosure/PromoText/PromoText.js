import React from 'react'
import PropTypes from 'prop-types'

import { FormattedMessage } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './PromoText.scss'


const PromoText = ({ className }) => (
  <h3 styleName="promoText">
    <span styleName="promoTextColored">Swap.online</span>
    <br />
    <FormattedMessage id="PromoText14" defaultMessage="Multi-currency" />
    <br />
    <FormattedMessage id="PromoText16" defaultMessage="crypto wallet" />
  </h3>
)

export default CSSModules(PromoText, styles)
