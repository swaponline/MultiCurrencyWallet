import { useState, useEffect } from 'react'
import CSSModules from 'react-css-modules'
import actions from 'redux/actions'
import cx from 'classnames'

import styles from 'pages/Wallet/Wallet.scss'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import { BigNumber } from 'bignumber.js'
import config from 'helpers/externalConfig'
import metamask from 'helpers/metamask'
import { FormattedMessage } from 'react-intl'
import dollar from './images/dollar.svg'
import btc from './images/btcIcon.svg'
import reducers from 'redux/core/reducers'


const BalanceForm = function ({
  activeFiat,
  activeCurrency,
  onChangeFiat = () => {},
  fiatBalance,
  currencyBalance,
  handleReceive,
  handleWithdraw,
  currency,
  currencyView = false,
  handleInvoice = () => {},
  isFetching = false,
  showButtons = true,
  type,
  singleWallet = false,
  multisigPendingCount = 10,
}) {
  const [selectedCurrency, setActiveCurrency] = useState(activeCurrency)
  const isWidgetBuild = config && config.isWidget

  const [ fiatDropShowed, setFiatDropShowed ] = useState(false)
  
  const handleShowFiatDrop = () => {
    setFiatDropShowed(true)
  }
  
  useEffect(() => {
    if (type === 'wallet' && activeCurrency !== activeFiat.toLowerCase()) {
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
    case 'btc (multisig)':
    case 'btc (pin-protected)':
      currency = 'BTC'
      break
  }

  const handleChangeFiat = async (fiat) => {
    localStorage.setItem('SO_ACTIVE_FIAT', fiat)
    setActiveCurrency(fiat)
    reducers.user.setActiveFiat({ activeFiat: fiat })
    const wallets = actions.core.getWallets().map((i) => { return (i.tokenKey || i.currency).toLowerCase() })
    setFiatDropShowed(false)
    await actions.user.getInfoAboutCurrency(wallets)
    onChangeFiat()
  }
  
  const handleClickCurrency = (currency) => {
    setActiveCurrency(currency)
    actions.user.pullActiveCurrency(currency)
    if (config.opts.fiats && config.opts.fiats.length > 0) {
      setFiatDropShowed(true)
    }
  }

  const handleGoToMultisig = () => {
    actions.multisigTx.goToLastWallet()
  }

  const buttonsDisabled = !((config.opts.ui.disableInternalWallet && metamask.isConnected()) || !config.opts.ui.disableInternalWallet)

  const sendButtonDisabled = !currencyBalance || buttonsDisabled

  return (
    <div
      styleName={
        `${isWidgetBuild && !config.isFullBuild ? 'yourBalance widgetBuild' : 'yourBalance'}`
      }
    >
      <div styleName="yourBalanceTop" className="data-tut-widget-balance">
        <p styleName="yourBalanceDescr">
          {singleWallet
            ? <FormattedMessage id="YourWalletbalance" defaultMessage="Balance" />
            : <FormattedMessage id="Yourtotalbalance" defaultMessage="Ваш общий баланс" />}
        </p>
        <div styleName="yourBalanceValue">
          {isFetching && (
            <div styleName="loaderHolder">
              <InlineLoader />
            </div>
          )}
          {((selectedCurrency === active) || (config.opts.totalBalanceHideBtc)) ? (
            // eslint-disable-next-line no-restricted-globals
            <p>
              {(activeFiat === 'USD' || activeFiat === 'CAD') && <img src={dollar} alt="dollar" />}
              {
                // eslint-disable-next-line no-restricted-globals
                !isNaN(fiatBalance) ? (
                  Number((new BigNumber(fiatBalance).dp(2, BigNumber.ROUND_FLOOR).toString())).toLocaleString('en-US', {
                    currency: activeFiat,
                  })
                ) : ''
                
              }
            </p>
          ) : (
            <p className="data-tut-all-balance">
              {currency.toUpperCase() === 'BTC' ? <img src={btc} alt="btc" /> : ''}
              {new BigNumber(currencyBalance).dp(6, BigNumber.ROUND_FLOOR).toString()}
            </p>
          )}
        </div>
        <div styleName="yourBalanceCurrencies">
          <div styleName="button">
            <button
              type="button"
              styleName={selectedCurrency === active ? 'active' : undefined}
              onClick={() => {
                if (config.opts.fiats && config.opts.fiats.length > 0) {
                  setFiatDropShowed(true)
                } else {
                  handleClickCurrency(active)
                }
              }}
            >
              {active}
            </button>
            {config.opts.fiats && config.opts.fiats.length > 0 && (
              <>
                <span onClick={() => setFiatDropShowed(true) }></span>
                {fiatDropShowed && (
                  <>
                    <div styleName="dropBg" onClick={() => { setFiatDropShowed(false) }} ></div>
                    <div styleName="fiatsDropdown">
                      <ul>
                        {config.opts.fiats.map((fiat) => {
                          return (
                            <li key={fiat} onClick={() => { handleChangeFiat(fiat) }}>{fiat}</li>
                          )
                        })}
                      </ul>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          {!config.opts.totalBalanceHideBtc && (
            <>
              <span styleName="separator" />
              <button
                type="button"
                styleName={selectedCurrency === currency ? 'active' : undefined}
                onClick={() => handleClickCurrency(currency)}
              >
                {currencyView || currency}
              </button>
            </>
          )}
        </div>
      </div>
      {multisigPendingCount > 0 && (
        <div onClick={handleGoToMultisig}>
          <p styleName="multisigWaitCount">
            <FormattedMessage
              id="Balance_YouAreHaveNotSignegTx"
              defaultMessage="{count} transaction needs your confirmation"
              values={{
                count: multisigPendingCount,
              }}
            />
          </p>
        </div>
      )}
      <div
        className={cx({
          [styles.yourBalanceBottomWrapper]: true,
        })}
      >
        <div styleName="yourBalanceBottom">
          {showButtons ? (
            <div styleName="btns" className="data-tut-withdraw-buttons">
              <Button blue disabled={buttonsDisabled} id="depositBtn" onClick={() => handleReceive('Deposit')}>
                <FormattedMessage id="YourtotalbalanceDeposit" defaultMessage="Пополнить" />
              </Button>
              <Button blue disabled={sendButtonDisabled} id={!sendButtonDisabled ? 'sendBtn' : ''} onClick={() => handleWithdraw('Send')}>
                <FormattedMessage id="YourtotalbalanceSend" defaultMessage="Отправить" />
              </Button>
            </div>
          ) : (
            <Button blue disabled={!currencyBalance} styleName="button__invoice" onClick={handleInvoice}>
              <FormattedMessage id="RequestPayment" defaultMessage="Запросить" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CSSModules(BalanceForm, styles, { allowMultiple: true })
