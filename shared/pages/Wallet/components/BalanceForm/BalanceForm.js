import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'
import styles from 'pages/Wallet/Wallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'
import icons from './images'

function BalanceForm({usdBalance, currencyBalance, handleReceive, handleWithdraw, currency}) {
  const [activeCurrency, setActiveCurrency] = useState('usd');

  return (
    <div styleName={`yourBalance`}>
      <div styleName="yourBalanceTop">
        {/* <img
          styleName="yourBalanceImg"
          src={icons[currency]}
          alt={`${name} icon`}
          role="image"
        /> */}
        <p styleName="yourBalanceDescr">Your total balance</p>
        <div styleName="yourBalanceValue">
          {activeCurrency === 'usd' ? <p>{usdBalance !== null ? usdBalance.toFixed(2) : 0}</p> : <p>{parseFloat(currencyBalance).toFixed(5)}</p>}
          <span>+0.0%</span>
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
      </div>
    </div>
  );
}

export default CSSModules(BalanceForm, styles, { allowMultiple: true })
