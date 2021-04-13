import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './Promo.scss'
import { FormattedMessage } from 'react-intl'

const Promo = () => {
  return (
    <div styleName="promo">
      <div styleName="promoWrap">
        <h3 styleName="promoText">
          <FormattedMessage id="ExchangeTitleTag1" defaultMessage="Fastest cross-chain swaps" />
        </h3>
      </div>
    </div>
  )
}

export default CSSModules(Promo, styles)
