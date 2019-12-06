import React from 'react'
import { FormattedMessage } from 'react-intl'


export const subHeaderText1 = () => (
  <FormattedMessage
    id="createWalletSubHeader1"
    defaultMessage="Укажите валюту кошелька"
  />
)

/* eslint-disable */
export const cupture1 = () => (
  <FormattedMessage
    id="createWalletCapture1"
    defaultMessage="На выбор Bitcoin, Ethereum, USDT, EUROS, Swap или все сразу"
  />
)

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
