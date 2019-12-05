import React, { Fragment } from 'react'

import CSSModules from 'react-css-modules'
import styles from './Wallet.scss'
import NewButton from 'components/controls/NewButton/NewButton'

import dollar from './images/dollar.svg'
import dollar2 from './images/dollar2.svg'
import btcIcon from './images/btcIcon.svg'

import ReactTooltip from 'react-tooltip'
import ParticalClosure from "../PartialClosure/PartialClosure"

import { FormattedMessage } from 'react-intl'


const BalanceForm = ({ activeView, activeCurrency, usdBalance, btcBalance }) => (
  <div styleName={`yourBalance`} className="data-tut-all-balance">
    <div styleName="yourBalanceTop">
      <p styleName="yourBalanceDescr">Your total balance</p>
      <div styleName="yourBalanceValue">
        {activeCurrency === 'usd' ? <img src={dollar} /> : <img src={btcIcon} />}
        {activeCurrency === 'usd' ? <p>{usdBalance.toFixed(2)}</p> : <p>{parseFloat(btcBalance).toFixed(5)}</p>}
        <span>+0.0%</span>
      </div>
      <div styleName="yourBalanceCurrencies">
        <button styleName={activeCurrency === 'usd' && 'active'} onClick={() => this.setState({ activeCurrency: 'usd' })}>
          <img src={dollar2} />
        </button>
        <span></span>
        <button styleName={activeCurrency === 'btc' && 'active'} onClick={() => this.setState({ activeCurrency: 'btc' })}>
          <img src={btcIcon} />
        </button>
      </div>
    </div>
    <div styleName="yourBalanceBottom">
      <Fragment>
        <NewButton className="data-tut-all-deposit" blue id="depositBtn">
          Deposit
        </NewButton>
        <ReactTooltip id="depositBtn" type="light" effect="solid">
          <FormattedMessage id="depositBtn" defaultMessage="Для пополнения валюты нажмите три точки напротив нужного актива" />
        </ReactTooltip>
      </Fragment>
      <Fragment>
        <NewButton blue id="sendBtn">
          Send
        </NewButton>
        <ReactTooltip id="sendBtn" type="light" effect="solid">
          <FormattedMessage id="sendBtn" defaultMessage="Для отправки валюты нажмите три точки напротив нужного актива" />
        </ReactTooltip>
      </Fragment>
    </div>
  </div>
)

export default CSSModules(BalanceForm, styles, { allowMultiple: true })
