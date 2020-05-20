import React, { Fragment, useState } from 'react'
import CSSModules from 'react-css-modules'
import { connect } from 'redaction'
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
}) {
  const savedActiveCurrency = localStorage.getItem(constants.localStorage.balanceActiveCurrency)
  const [activeCurrency, setActiveCurrency] = useState(savedActiveCurrency || 'btc')
  const isWidgetBuild = config && config.isWidget
  const isAnyModalCalled = Object.keys(modals).length

  const active = activeFiat ? activeFiat.toLowerCase() : 'usd'
  // eslint-disable-next-line default-case
  switch (currency) {
    case 'btc (sms-protected)':
    case 'btc (multisig)':
      currency = 'BTC'
      break
  }

  return (
    <div styleName={isWidgetBuild && !config.isFullBuild ? 'yourBalance widgetBuild' : 'yourBalance'}>
      <div styleName="yourBalanceTop">
        <p styleName="yourBalanceDescr">
          <FormattedMessage id="Yourtotalbalance" defaultMessage="Ваш общий баланс" />
        </p>
        <div styleName="yourBalanceValue">
          {isFetching && (
            <div styleName="loaderHolder">
              <InlineLoader />
            </div>
          )}
          {activeCurrency === active
            ? (
              // eslint-disable-next-line no-restricted-globals
              <p>
                {activeFiat === 'USD' || activeFiat === 'CAD' && <img src={dollar} alt="dollar" />}
                {
                  // eslint-disable-next-line no-restricted-globals
                  !isNaN(fiatBalance)
                    ? BigNumber(fiatBalance)
                      .dp(2, BigNumber.ROUND_FLOOR)
                      .toString()
                    : ''
                }
                {/* {changePercent ? (
                  <span styleName={changePercent > 0 ? "green" : "red"}>
                    {`${changePercent > 0 ? `+${changePercent}` : `${changePercent}`}`}%
                  </span>
                ) : (
                  ""
                )} */}
              </p>
            )
            : (
              <p className="data-tut-all-balance">
                {currency === 'BTC' ? <img src={btc} alt="btc" /> : ''}
                {BigNumber(currencyBalance)
                  .dp(5, BigNumber.ROUND_FLOOR)
                  .toString()}
              </p>
            )
          }
        </div>
        <div styleName="yourBalanceCurrencies">
          <button
            styleName={activeCurrency === active && 'active'}
            onClick={() => {
              // eslint-disable-next-line no-unused-expressions, no-sequences
              setActiveCurrency(active), localStorage.setItem(constants.localStorage.balanceActiveCurrency, active)
            }}
          >
            {/* // eslint-disable-next-line reactintl/contains-hardcoded-copy */}
            {active}
          </button>
          <span />
          <button
            styleName={activeCurrency === 'btc' && 'active'}
            onClick={() => {
              // eslint-disable-next-line no-unused-expressions, no-sequences
              setActiveCurrency('btc'), localStorage.setItem(constants.localStorage.balanceActiveCurrency, 'btc')
            }}
          >
            {currency}
          </button>
        </div>
      </div>
      <div
        className={cx({
          [styles.yourBalanceBottomWrapper]: true,
          [styles.yourBalanceBottomWrapper_blured]: dashboardView && isAnyModalCalled,
        })}
      >
        <div styleName="yourBalanceBottom">
          {showButtons ?
            <Fragment>
              <Button blue id="depositBtn" onClick={() => handleReceive('Deposit')}>
                <FormattedMessage id="YourtotalbalanceDeposit" defaultMessage="Пополнить" />
              </Button>
              <Button blue disabled={!currencyBalance} id="sendBtn" onClick={() => handleWithdraw('Send')}>
                <FormattedMessage id="YourtotalbalanceSend" defaultMessage="Отправить" />
              </Button>
            </Fragment> :
            <Button blue disabled={!currencyBalance} styleName="button__invoice" onClick={() => handleInvoice()}>
              <FormattedMessage id="RequestPayment" defaultMessage="Запросить" />
            </Button>
          }
        </div>
      </div>
    </div>
  )
}

export default connect(({
  modals,
  ui: { dashboardModalsAllowed },
}) => ({
  modals,
  dashboardView: dashboardModalsAllowed,
}))(CSSModules(BalanceForm, styles, { allowMultiple: true }))
