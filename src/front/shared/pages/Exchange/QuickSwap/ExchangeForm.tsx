import { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { utils } from 'helpers'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import actions from 'redux/actions'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import SelectGroup from '../SelectGroup/SelectGroup'
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
      return wrongTooltip ? null : (
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

  const keyUpHandler = () => {
    setTimeout(checkSwapData, 300)
  }

  return (
    <form action="">
      <div styleName="inputWrapper">
        <SelectGroup
          activeFiat={fiat}
          fiat={fiatValue && fiatValue}
          inputValueLink={stateReference.spendedAmount}
          selectedValue={spendedCurrency.value}
          label={<FormattedMessage id="partial243" defaultMessage="You send" />}
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
        <Button
          styleName="bankCardButton"
          pending={isPending}
          disabled={isPending}
          onClick={openExternalExchange}
          empty
          small
        >
          <FormattedMessage id="buyViaBankCard" defaultMessage="Buy via bank card" />
        </Button>
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

      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance" />
          <Tooltip id="slippageTooltip">
            <FormattedMessage
              id="slippageNotice"
              defaultMessage="If the price changes between the time your order is placed and confirmed it’s called “slippage”. Your swap will automatically cancel if slippage exceeds your “max slippage” setting"
            />
          </Tooltip>
        </FieldLabel>
        <Input
          pattern="0-9\."
          onKeyDown={inputReplaceCommaWithDot}
          onKeyUp={keyUpHandler}
          valueLink={stateReference.slippage}
          withMargin
        />
      </div>
    </form>
  )
}

export default CSSModules(ExchangeForm, styles, { allowMultiple: true })
