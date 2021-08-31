import { useState, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { utils, localStorage } from 'helpers'
import actions from 'redux/actions'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import SelectGroup from '../SelectGroup/SelectGroup'
import { QuickSwapFormTour } from 'components/Header/WidgetTours'
import { Direction } from './types'

function ExchangeForm(props) {
  const {
    stateReference,
    currencies,
    receivedList,
    spendedAmount,
    spendedCurrency,
    receivedCurrency,
    selectCurrency,
    fiat,
    fromWallet,
    toWallet,
    updateWallets,
    isPending,
    openExternalExchange,
    checkSwapData,
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
          <FormattedMessage id="partial767" defaultMessage="Balance: " />

          <button styleName="balanceUpdateBtn" onClick={() => updateBalance(direction, wallet)}>
            {wallet.balance}
            <i className="fas fa-sync-alt" styleName="icon" />
          </button>
        </span>
      )
    }

    return null
  }

  const [flagForRequest, setFlagForRequest] = useState(false)

  const keyUpHandler = () => {
    setFlagForRequest(true)
  }

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined

    if (flagForRequest) {
      timeoutId = setTimeout(() => {
        checkSwapData()
        setFlagForRequest(false)
      }, 400)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  })

  return (
    <form action="">
      <div styleName="inputWrapper">
        <SelectGroup
          activeFiat={fiat}
          fiat={fiatValue && fiatValue}
          inputValueLink={stateReference.spendedAmount}
          selectedValue={spendedCurrency.value}
          label={<FormattedMessage id="MyOrdersYouSend" defaultMessage="You send" />}
          id="needToRenameThisId"
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
          onKeyUp={keyUpHandler}
          onSelect={(value) =>
            selectCurrency({
              direction: Direction.Spend,
              value,
            })
          }
        />
      </div>

      {spendedCurrency.value === 'eth' && (
        <>
          <Button
            id="buyViaBankCardButton"
            className="buyViaBankCardButton"
            styleName="bankCardButton"
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

      <div styleName="inputWrapper">
        <SelectGroup
          disabled
          activeFiat={fiat}
          inputValueLink={stateReference.receivedAmount}
          selectedValue={receivedCurrency.value}
          label={<FormattedMessage id="partial255" defaultMessage="You get" />}
          id="needToRenameThisIdTwo"
          currencies={receivedList}
          placeholder="0"
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
      <QuickSwapFormTour isTourOpen={isTourOpen} closeTour={closeTour} />
    </form>
  )
}

export default CSSModules(ExchangeForm, styles, { allowMultiple: true })
