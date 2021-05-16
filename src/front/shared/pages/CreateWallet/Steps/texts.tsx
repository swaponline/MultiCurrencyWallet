import React from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'

import styles from '../CreateWallet.scss'


export const subHeaderText1 = () => (
  <FormattedMessage
    id="createWalletSubHeader1"
    defaultMessage="Укажите валюту кошелька"
  />
)

/* eslint-disable */
const Cupture = () => (
  <>
    <span styleName="cupture1">
      <FormattedMessage
        id="createWalletCapture1"
        defaultMessage="На выбор Bitcoin, Ethereum, Swap, Tokens"
      />
    </span>
  </>
)

export default CSSModules(Cupture, styles, { allowMultiple: true })

export const subHeaderText2 = () => (
  <FormattedMessage
    id="createWalletSubHeader2"
    defaultMessage="Выберите уровень защиты вашего кошелька"
  />
)

export const cupture2 = () => (
  <FormattedMessage
    id="createWalletCapture2"
    defaultMessage="Без защиты, sms, google auth, мультисиг"
  />
)
/* eslint-enable */
