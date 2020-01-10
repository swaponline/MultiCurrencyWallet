import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from 'pages/Wallet/Wallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'
import { BigNumber } from 'bignumber.js'
import config from 'app-config'
import { FormattedMessage } from 'react-intl'


function BalanceForm({ usdBalance, currencyBalance, handleReceive, handleWithdraw, handleExchange, currency, changePercent }) {
  const [activeCurrency, setActiveCurrency] = useState('usd');
  const isWidgetBuild = (config && config.isWidget)

  switch (currency) {
    case 'btc (sms-protected)': currency = 'BTC SMS'
    case 'btc (multisig)': currency = 'BTC MULTISIG'
      break;
  }

  return (
    <div styleName={`yourBalance`}>
      <div styleName="yourBalanceTop">
        <p styleName="yourBalanceDescr">
          <FormattedMessage id="Yourtotalbalance" defaultMessage="Ваш общий баланс" />
        </p>
        <div styleName="yourBalanceValue">
          {activeCurrency === 'usd' ? <p>{!isNaN(usdBalance) ? 
            BigNumber(usdBalance).dp(2, BigNumber.ROUND_FLOOR).toString() : ''}</p> : 
            <p>
              {BigNumber(currencyBalance).dp(5, BigNumber.ROUND_FLOOR).toString()}
              {changePercent ? <span styleName={changePercent > 0 ? 'green' : 'red'}>{`${changePercent > 0 ? `+${changePercent}` : `${changePercent}`}`}%</span> : ''}
            </p>
          }
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
            <FormattedMessage id="YourtotalbalanceDeposit" defaultMessage="Пополнить" />
          </NewButton>
        </Fragment>
        <Fragment>
          <NewButton blue disabled={!currencyBalance} id="sendBtn" onClick={() => handleWithdraw('Send')}>
            <FormattedMessage id="YourtotalbalanceSend" defaultMessage="Отправить" />
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
