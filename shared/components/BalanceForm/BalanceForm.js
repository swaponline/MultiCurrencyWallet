import React, { Fragment, useState, useEffect } from 'react'
import CSSModules from 'react-css-modules'
import { connect } from 'redaction'
import actions from 'redux/actions'
import cx from 'classnames'

import styles from 'pages/Wallet/Wallet.scss'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { links, constants } from 'helpers'
import { BigNumber } from 'bignumber.js'
import config from 'app-config'
import { FormattedMessage } from 'react-intl'
import dollar from './images/dollar.svg'
import btc from './images/btcIcon.svg'


function BalanceForm({
  activeFiat,
  activeCurrency,
  fiatBalance,
  currencyBalance,
  handleReceive,
  handleWithdraw,
  currency,
  handleInvoice,
  isFetching = false,
  showButtons = true,
  dashboardView,
  modals,
  type,
}) {
  const savedActiveCurrency = localStorage.getItem(constants.localStorage.balanceActiveCurrency)
  const [selectedCurrency, setActiveCurrency] = useState(activeCurrency)

  const isWidgetBuild = config && config.isWidget
  const isAnyModalCalled = Object.keys(modals).length

  useEffect(() => {
    if (type === 'wallet' && activeCurrency !== 'usd') {
      setActiveCurrency('btc')
    } else {
      setActiveCurrency(activeCurrency)
    }
  }, [activeCurrency])

  const active = activeFiat ? activeFiat.toLowerCase() : 'usd'

  // @ToDo
  // в Data у валют есть флаги isUserProtected и isSMSProtected
  // нужно по ним проверять, а не по "служебному" названию монеты
  // Use flags in currency data (isUserProtected and isSMSProtected)
  // eslint-disable-next-line default-case
  switch (currency) {
    case 'btc (sms-protected)':
    case 'btc (multisig)':
    case 'btc (pin-protected)':
      currency = 'BTC'
      break
  }

  const handleClickCurrency = (currency) => {
    setActiveCurrency(currency)
    actions.user.pullActiveCurrency(currency)
  }

  return (
    <div styleName={isWidgetBuild && !config.isFullBuild ? 'yourBalance widgetBuild' : 'yourBalance'}>
      <div styleName="yourBalanceTop" className="data-tut-widget-balance">
        <p styleName="yourBalanceDescr">
          <FormattedMessage id="Yourtotalbalance" defaultMessage="Ваш общий баланс" />
        </p>
        <div styleName="yourBalanceValue">
          {isFetching && (
            <div styleName="loaderHolder">
              <InlineLoader />
            </div>
          )}
          {selectedCurrency === active ? (
            // eslint-disable-next-line no-restricted-globals
            <p>
              {(activeFiat === 'USD' || activeFiat === 'CAD') && <img src={dollar} alt="dollar" />}
              {
                // eslint-disable-next-line no-restricted-globals
                !isNaN(fiatBalance) ? BigNumber(fiatBalance).dp(2, BigNumber.ROUND_FLOOR).toString() : ''
              }
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
              {currency.toUpperCase() === 'BTC' ? <img src={btc} alt="btc" /> : ''}
              {BigNumber(currencyBalance).dp(5, BigNumber.ROUND_FLOOR).toString()}
            </p>
          )}
        </div>
        <div styleName="yourBalanceCurrencies">
          <button
            styleName={selectedCurrency === active && 'active'}
            onClick={() => handleClickCurrency(active)}
          >
            {/* // eslint-disable-next-line reactintl/contains-hardcoded-copy */}
            {active}
          </button>
          <span />
          <button
            styleName={selectedCurrency === currency && 'active'}
            onClick={() => handleClickCurrency(currency)}
          >
            {currency}
          </button>
        </div>
      </div>
      <div
        className={cx({
          [styles.yourBalanceBottomWrapper]: true,
        })}
      >
        <div styleName="yourBalanceBottom">
          {showButtons ? (
            <div styleName="btns" className="data-tut-withdraw-buttons">
              <Button blue id="depositBtn" onClick={() => handleReceive('Deposit')}>
                <FormattedMessage id="YourtotalbalanceDeposit" defaultMessage="Пополнить" />
              </Button>
              <Button blue disabled={!currencyBalance} id="sendBtn" onClick={() => handleWithdraw('Send')}>
                <FormattedMessage id="YourtotalbalanceSend" defaultMessage="Отправить" />
              </Button>
            </div>
          ) : (
            <Button blue disabled={!currencyBalance} styleName="button__invoice" onClick={() => handleInvoice()}>
              <FormattedMessage id="RequestPayment" defaultMessage="Запросить" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default connect(({ modals, ui: { dashboardModalsAllowed } }) => ({
  modals,
  dashboardView: dashboardModalsAllowed,
}))(CSSModules(BalanceForm, styles, { allowMultiple: true }))
