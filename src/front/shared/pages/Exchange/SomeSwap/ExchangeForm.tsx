import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { utils } from 'helpers'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import SelectGroup from '../SelectGroup/SelectGroup'

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
    isPending,
    openExternalExchange,
    checkSwapData,
  } = props

  const hasFiatAmount = spendedAmount && fromWallet.infoAboutCurrency?.price
  const fiatValue =
    hasFiatAmount &&
    utils.toMeaningfulFiatValue({
      value: spendedAmount,
      rate: fromWallet.infoAboutCurrency.price,
    })

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
            <span styleName="balanceTooltip">
              <FormattedMessage id="partial767" defaultMessage="Balance: " />
              {fromWallet.balance}
            </span>
          }
          onKeyUp={checkSwapData}
          onSelect={(value) =>
            selectCurrency({
              direction: 'spend',
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
            <span styleName="balanceTooltip">
              <FormattedMessage id="partial767" defaultMessage="Balance: " />
              {toWallet.balance}
            </span>
          }
          onSelect={(value) => {
            selectCurrency({
              direction: 'receive',
              value,
            })
          }}
        />
      </div>

      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="slippageTolerance" defaultMessage="Slippage tolerance" />
          <Tooltip id="slippageTooltip">
            <FormattedMessage id="slippageNotice" defaultMessage="Some useful notice for user" />
          </Tooltip>
        </FieldLabel>
        <Input
          pattern="0-9\."
          onKeyDown={inputReplaceCommaWithDot}
          valueLink={stateReference.slippage}
          withMargin
        />
      </div>
    </form>
  )
}

export default CSSModules(ExchangeForm, styles, { allowMultiple: true })
