import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'

import styles from 'pages/Wallet/Wallet.scss'
import Button from 'components/controls/Button/Button'
import { links, constants } from 'helpers'
import { BigNumber } from 'bignumber.js'
import config from 'app-config'
import { FormattedMessage } from 'react-intl'
import FAQ from '../FAQ/FAQ'
import dollar from '../../images/dollar.svg'
import btc from '../../images/btc.svg'


function BalanceForm({
  usdBalance,
  currencyBalance,
  handleReceive,
  handleWithdraw,
  handleExchange,
  currency,
  handleInvoice,
  changePercent,
  showButtons = true,
}) {
  const savedActiveCurrency = localStorage.getItem(constants.localStorage.balanceActiveCurrency)
  const [activeCurrency, setActiveCurrency] = useState(savedActiveCurrency || 'btc')
  const isWidgetBuild = config && config.isWidget

  // eslint-disable-next-line default-case
  switch (currency) {
    case 'btc (sms-protected)':
    case 'btc (multisig)':
      currency = 'BTC'
      break
  }

  // console.log('activeCurrency', activeCurrency)

  return (
    <div styleName={isWidgetBuild && !config.isFullBuild ? 'yourBalance widgetBuild' : 'yourBalance'}>
      <div styleName="yourBalanceTop">
        <p styleName="yourBalanceDescr">
          <FormattedMessage id="Yourtotalbalance" defaultMessage="Ваш общий баланс" />
        </p>
        <div styleName="yourBalanceValue">
          {activeCurrency === 'usd' ? (
            // eslint-disable-next-line no-restricted-globals
            <p>
              <img src={dollar} alt="dollar" />
              {!isNaN(usdBalance)
                ? BigNumber(usdBalance)
                    .dp(2, BigNumber.ROUND_FLOOR)
                    .toString()
                : ''}
              {/* {changePercent ? (
                <span styleName={changePercent > 0 ? "green" : "red"}>
                  {`${changePercent > 0 ? `+${changePercent}` : `${changePercent}`}`}%
                </span>
              ) : (
                ""
              )} */}
            </p>
          ) : (
            <p className="data-tut-all-balance">
              {currency === 'btc' ? <img src={btc} alt="btc" /> : ''}
              {BigNumber(currencyBalance)
                .dp(5, BigNumber.ROUND_FLOOR)
                .toString()}
            </p>
          )}
        </div>
        <div styleName="yourBalanceCurrencies">
          <button
            styleName={activeCurrency === 'usd' && 'active'}
            onClick={() => {
              setActiveCurrency('usd'), localStorage.setItem(constants.localStorage.balanceActiveCurrency, 'usd')
            }}
          >
            {/* // eslint-disable-next-line reactintl/contains-hardcoded-copy */}
            usd
          </button>
          <span />
          <button
            styleName={activeCurrency === 'btc' && 'active'}
            onClick={() => {
              setActiveCurrency('btc'), localStorage.setItem(constants.localStorage.balanceActiveCurrency, 'btc')
            }}
          >
            {currency}
          </button>
        </div>
      </div>
      <div styleName="yourBalanceBottomWrapper">
        <div styleName="yourBalanceBottom">
          {showButtons ? (
            <Fragment>
              <Button blue id="depositBtn" onClick={() => handleReceive('Deposit')}>
                <FormattedMessage id="YourtotalbalanceDeposit" defaultMessage="Пополнить" />
              </Button>
              <Button blue disabled={!currencyBalance} id="sendBtn" onClick={() => handleWithdraw('Send')}>
                <FormattedMessage id="YourtotalbalanceSend" defaultMessage="Отправить" />
              </Button>
              {isWidgetBuild && !config.isFullBuild && (
                <Button brand id="exchangeBtn" onClick={() => handleExchange()}>
                  <FormattedMessage id="YourtotalbalanceExchange" defaultMessage="Обменять" />
                </Button>
              )}
            </Fragment>
          ) : (
            <Button blue disabled={!currencyBalance} styleName="button__invoice" onClick={() => handleInvoice()}>
              <FormattedMessage id="RequestPayment" defaultMessage="Запросить" />
            </Button>
          )}
        </div>
        <div styleName="desktopEnabledViewForFaq faqWrapper balanceInnerFaqWrapper">
          <FAQ />
        </div>
      </div>
    </div>
  )
}

export default CSSModules(BalanceForm, styles, { allowMultiple: true })