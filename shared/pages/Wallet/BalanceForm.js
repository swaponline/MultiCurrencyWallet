import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'
import styles from './Wallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'

import dollar from './images/dollar.svg'
import dollar2 from './images/dollar2.svg'
import btcIcon from './images/btcIcon.svg'

import ReactTooltip from 'react-tooltip'

import { FormattedMessage } from 'react-intl'

function BalanceForm({usdBalance, btcBalance, handleModalOpen}) {
  const [activeCurrency, setActiveCurrency] = useState('usd');

  return (
    <div styleName={`yourBalance`}>
      <div styleName="yourBalanceTop">
        <p styleName="yourBalanceDescr">Your total balance</p>
        <div styleName="yourBalanceValue">
          {activeCurrency === 'usd' ? <img src={dollar} /> : <img src={btcIcon} />}
          {activeCurrency === 'usd' ? <p>{usdBalance.toFixed(2)}</p> : <p>{parseFloat(btcBalance).toFixed(5)}</p>}
          <span>+0.0%</span>
        </div>
        <div styleName="yourBalanceCurrencies">
          <button styleName={activeCurrency === 'usd' && 'active'} onClick={() => setActiveCurrency('usd')}>
            <img src={dollar2} />
          </button>
          <span></span>
          <button styleName={activeCurrency === 'btc' && 'active'} onClick={() => setActiveCurrency('btc')}>
            <img src={btcIcon} />
          </button>
        </div>
      </div>
      <div styleName="yourBalanceBottom">
        <Fragment>
          <NewButton blue id="depositBtn" onClick={() => handleModalOpen('Deposit')}>
            Deposit
          </NewButton>
        </Fragment>
        <Fragment>
          <NewButton blue id="sendBtn" onClick={() => handleModalOpen('Send')}>
            Send
          </NewButton>
        </Fragment>
      </div>
    </div>
  );
}

export default CSSModules(BalanceForm, styles, { allowMultiple: true })
