import React, { Component } from 'react'
import CSSModules from 'react-css-modules'

import { connect } from 'redaction'

import ReactTooltip from 'react-tooltip'

import styles from './CreateWallet.scss'
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl'
// import  from 'components/ui/CurrencyIcon/images'


const CreateWallet = (props) => {
  const coins = [
    { name: 'btc', capture: 'Bitcoin' },
    { name: 'eth', capture: 'Ethereum' },
    { name: 'usdt', capture: 'Stablecoin' },
    { name: 'eurs', capture: 'Stablecoin' },
    { name: 'swap', capture: 'Swap' },
  ]
  return (
    <div styleName="wrapper">
      <div styleName="formBody">
        <h2>
          <FormattedMessage id="createWalletHeader1" defaultMessage="Create the wallet by 3 simple steps?" />
        </h2>
        <div styleName="inLine">
          <div styleName="stepNumber">1</div>
          <div styleName="stepNumber">2</div>
          <div styleName="stepNumber">3</div>
        </div>
        <div>
          <div styleName="subHeader">
            <h5>
              <FormattedMessage
                id="createWalletSubHeader1"
                defaultMessage="Choose the wallets currency"
              />
            </h5>
            <p styleName="capture">
              <FormattedMessage
                id="createWalletCapture1"
                defaultMessage="To choose Bitcoin, Ethereum, USDT, EUROS, Swap  or all at once"
              />
            </p>
          </div>
          {coins.map(el => {
            const { name, capture } = el
            return (
              <div styleName="card">
                <div style={{ display: "block" }}>
                  <FormattedMessage id="createWalletCapture1" defaultMessage="to btc" />
                  {capture}
                </div>
              </div>
            )
          })}
          <button styleName="continue">
            <FormattedMessage id="createWalletButton1" defaultMessage="Continue" />
          </button>
        </div>
      </div>
    </div>
  )
}
export default CSSModules(CreateWallet, styles, { allowMultiple: true })
