import React from 'react'
import { FormattedMessage } from 'react-intl'


export const subHeaderText1 = () => (
  <FormattedMessage
    id="createWalletSubHeader1"
    defaultMessage="Choose the wallets currency"
  />
)

/* eslint-disable */
export const cupture1 = () => (
  <FormattedMessage
    id="createWalletCapture1"
    defaultMessage="To choose Bitcoin, Ethereum, USDT, EUROS, Swap  or all at once"
  />
)

export const subHeaderText2 = () => (
  <FormattedMessage
    id="createWalletSubHeader2"
    defaultMessage="Enter the user name and e-mail"
  />
)
export const cupture2 = () => (
  <FormattedMessage
    id="createWalletCapture2"
    defaultMessage="You will receive notifications of completed transactions from your wallet"
  />
)

export const subHeaderText3 = () => (
  <FormattedMessage
    id="createWalletSubHeader3"
    defaultMessage="Choose wallet protection level"
  />
)

export const cupture3 = () => (
  <FormattedMessage
    id="createWalletCapture3"
    defaultMessage="No protection, sms, google auth, multisig"
  />
)
/* eslint-enable */
