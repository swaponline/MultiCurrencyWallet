import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from 'pages/Wallet/Wallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'
import { BigNumber } from 'bignumber.js'
import config from 'app-config'


function BalanceForm({ usdBalance, currencyBalance, handleReceive, handleWithdraw, handleExchange, currency, infoAboutCurrency }) {
  const [activeCurrency, setActiveCurrency] = useState('usd');
  const isWidgetBuild = (config && config.isWidget)

  return (
    <div styleName={`yourBalance`}>
      <div styleName="yourBalanceTop">
        <p styleName="yourBalanceDescr">Your total balance</p>
        <div styleName="yourBalanceValue">
          {activeCurrency === 'usd' ? <p>{!isNaN(usdBalance) ? BigNumber(usdBalance).dp(2, BigNumber.ROUND_FLOOR).toString() : ''}</p> : <p>{BigNumber(currencyBalance).dp(5, BigNumber.ROUND_FLOOR).toString()}</p>}
          {infoAboutCurrency ? <span>+0.0%</span> : ''}
        </div>
        <div styleName="yourBalanceCurrencies">
          <button styleName={activeCurrency === 'usd' && 'active'} onClick={() => setActiveCurrency('usd')}>
            usd
          </button>
          <span></span>
          <button styleName={activeCurrency === 'btc' && 'active'} onClick={() => setActiveCurrency('btc')}>
            {currency}
          </button>
        </div>
      </div>
      <div styleName="yourBalanceBottom">
        <Fragment>
          <NewButton blue id="depositBtn" onClick={() => handleReceive('Deposit')}>
            Deposit
          </NewButton>
        </Fragment>
        <Fragment>
          <NewButton blue disabled={!currencyBalance} id="sendBtn" onClick={() => handleWithdraw('Send')}>
            Send
          </NewButton>
        </Fragment>
        {isWidgetBuild &&
          <NewButton brand id="exchangeBtn" onClick={() => handleExchange()}>
            Exchange
          </NewButton>
        }
      </div>
    </div>
  );
}

export default CSSModules(BalanceForm, styles, { allowMultiple: true })
