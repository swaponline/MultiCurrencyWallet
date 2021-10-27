import { useState, useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'redaction'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { utils, localStorage } from 'helpers'
import actions from 'redux/actions'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import Switching from 'components/controls/Switching/Switching'
import SelectGroup from 'components/SelectGroup'
import { QuickSwapFormTour } from 'components/Header/WidgetTours'
import { Direction } from './types'

const usePrevious = (value) => {
  const ref = useRef()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

function ExchangeForm(props) {
  const {
    stateReference,
    currencies,
    receivedList,
    spendedAmount,
    spendedCurrency,
    setSpendedAmount,
    receivedCurrency,
    selectCurrency,
    fiat,
    fromWallet,
    toWallet,
    updateWallets,
    isPending,
    flipCurrency,
    openExternalExchange,
    checkSwapData,
    user,
    insufficientBalance,
    resetSwapData,
    slippage,
  } = props

  const [fromBalancePending, setFromBalancePending] = useState(false)
  const [toBalancePending, setToBalancePending] = useState(false)

  const sawBankCardMessage = localStorage.getItem('sawBankCardMessage')
  const [isTourOpen, setIsTourOpen] = useState(!sawBankCardMessage)

  const closeTour = () => {
    setIsTourOpen(false)
    localStorage.setItem('sawBankCardMessage', true)
  }

  const hasFiatAmount = spendedAmount && fromWallet.infoAboutCurrency?.price
  const fiatValue =
    hasFiatAmount &&
    utils.toMeaningfulFiatValue({
      value: spendedAmount,
      rate: fromWallet.infoAboutCurrency.price,
    })

  const updateBalance = async (direction, wallet) => {
    if (!Object.keys(wallet).length) return

    const key = wallet.standard || wallet.currency

    if (direction === Direction.Spend) setFromBalancePending(true)
    if (direction === Direction.Receive) setToBalancePending(true)

    await actions[key.toLowerCase()].getBalance(wallet.tokenKey)

    updateWallets()

    setTimeout(() => {
      if (direction === Direction.Spend) setFromBalancePending(false)
      if (direction === Direction.Receive) setToBalancePending(false)
    }, 300)
  }

  const balanceTooltip = (direction, wallet) => {
    const wrongTooltip = wallet.balanceError || Number.isNaN(wallet.balance)

    if (!wrongTooltip) {
      return (
        <span styleName="balanceTooltip">
          <span styleName="title">
            <FormattedMessage id="partial767" defaultMessage="Balance: " />
          </span>

          <button styleName="balanceUpdateBtn" onClick={() => updateBalance(direction, wallet)}>
            {wallet.balance}
            <i className="fas fa-sync-alt" styleName="icon" />
          </button>
        </span>
      )
    }

    return null
  }

  const getWalletStoreData = (wallet): IUniversalObj | undefined => {
    let data = undefined

    if (Object.keys(wallet).length) {
      data = wallet.isToken
        ? user.tokensData[wallet.tokenKey.toLowerCase()]
        : user[`${wallet.currency.toLowerCase()}Data`]
    }

    return data
  }

  const fromWalletData = getWalletStoreData(fromWallet)
  const toWalletData = getWalletStoreData(toWallet)

  useEffect(() => {
    updateBalance(Direction.Spend, fromWallet)
  }, [fromWalletData?.balance])

  useEffect(() => {
    updateBalance(Direction.Receive, toWallet)
  }, [toWalletData?.balance])

  const [isBalanceFetching, setIsBalanceFetching] = useState(user.isBalanceFetching)
  const prevIsBalanceFetching = usePrevious(isBalanceFetching)

  useEffect(() => {
    setIsBalanceFetching(user.isBalanceFetching)

    // update in the end of balance fetching
    if (prevIsBalanceFetching && !user.isBalanceFetching) {
      updateBalance(Direction.Spend, fromWallet)
      updateBalance(Direction.Receive, toWallet)
    }
  }, [user.isBalanceFetching])

  const [flagForRequest, setFlagForRequest] = useState(false)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined

    if (flagForRequest) {
      timeoutId = setTimeout(async () => {
        await checkSwapData()
        setFlagForRequest(false)
      }, 600)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  })

  const handleSpendAmountInput = (value) => {
    setSpendedAmount(value)
    resetSwapData()

    if (value !== spendedAmount) {
      setFlagForRequest(true)
    }
  }

  const supportedCurrencies = ['eth', 'matic']
  const showFiatExchangeBtn =
    window.transakApiKey || supportedCurrencies.includes(spendedCurrency.value)

  return (
    <form action="">
      <div styleName="inputWrapper">
        <SelectGroup
          activeFiat={fiat}
          error={insufficientBalance}
          fiat={fiatValue && fiatValue}
          inputValueLink={stateReference.spendedAmount.pipe(handleSpendAmountInput)}
          selectedValue={spendedCurrency.value}
          label={<FormattedMessage id="MyOrdersYouSend" defaultMessage="You send" />}
          inputId="quickSwapSpendCurrencyInput"
          placeholder="0.0"
          currencies={currencies}
          inputToolTip={
            fromBalancePending ? (
              <div styleName="balanceLoader">
                <InlineLoader />
              </div>
            ) : (
              balanceTooltip(Direction.Spend, fromWallet)
            )
          }
          onSelect={(value) =>
            selectCurrency({
              direction: Direction.Spend,
              value,
            })
          }
        />
      </div>

      <div styleName={`formCenter ${showFiatExchangeBtn ? 'padding' : ''}`}>
        {showFiatExchangeBtn && (
          <>
            <Button
              id="buyViaBankCardButton"
              className="buyViaBankCardButton"
              styleName="fiatExchangeBtn"
              pending={isPending}
              disabled={isPending}
              onClick={openExternalExchange}
              empty
              small
            >
              <FormattedMessage id="buyViaBankCard" defaultMessage="Buy via bank card" />
            </Button>

            <Tooltip id="buyViaBankCardButton" place="top" mark={false}>
              <FormattedMessage
                id="bankCardButtonDescription"
                defaultMessage="In the modal window, you have to go through several steps to exchange fiat funds for ETH. Select ETH in the window and specify the address of your wallet (you can copy it below). Wait until the funds are credited to your address. Then you can buy tokens using it."
              />
            </Tooltip>
          </>
        )}

        <div styleName="arrows">
          <Switching noneBorder onClick={flipCurrency} />
        </div>
      </div>

      <div styleName={`inputWrapper ${receivedCurrency.notExist ? 'disabled' : ''}`}>
        <SelectGroup
          disabled
          activeFiat={fiat}
          inputValueLink={stateReference.receivedAmount}
          selectedValue={receivedCurrency.value}
          label={<FormattedMessage id="partial255" defaultMessage="You get" />}
          inputId="quickSwapReceiveCurrencyInput"
          currencies={receivedList}
          inputToolTip={
            toBalancePending ? (
              <div styleName="balanceLoader">
                <InlineLoader />
              </div>
            ) : (
              balanceTooltip(Direction.Receive, toWallet)
            )
          }
          onSelect={(value) => {
            selectCurrency({
              direction: Direction.Receive,
              value,
            })
          }}
        />
      </div>

      <p styleName="slippageIndicator">
        <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance" />
        <span>{`${slippage} %`}</span>
      </p>

      <QuickSwapFormTour isTourOpen={isTourOpen} closeTour={closeTour} />
    </form>
  )
}

export default connect(({ user }) => ({
  user,
}))(CSSModules(ExchangeForm, styles, { allowMultiple: true }))
