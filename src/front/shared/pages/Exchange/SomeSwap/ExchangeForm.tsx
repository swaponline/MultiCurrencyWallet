import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import SelectGroup from '../SelectGroup/SelectGroup'

function ExchangeForm(props) {
  const {
    stateReference,
    currencies,
    spendedCurrency,
    receivedCurrency,
    selectCurrency,
    fiat,
    fromWallet,
  } = props

  return (
    <form action="">
      <div styleName="inputWrapper">
        <SelectGroup
          activeFiat={fiat}
          inputValueLink={stateReference.spendedAmount}
          selectedValue={spendedCurrency.value}
          label={<FormattedMessage id="partial243" defaultMessage="You send" />}
          id="needToRenameThisId"
          placeholder="0.00000"
          currencies={currencies}
          inputToolTip={
            <span styleName="balanceTooltip">
              <FormattedMessage id="partial767" defaultMessage="Balance: " />
              {fromWallet.balance}
            </span>
          }
          onSelect={(value) =>
            selectCurrency({
              direction: 'spend',
              value,
            })
          }
        />
      </div>

      <div styleName="inputWrapper">
        <SelectGroup
          disabled
          activeFiat={fiat}
          inputValueLink={stateReference.receivedAmount}
          selectedValue={receivedCurrency.value}
          label={<FormattedMessage id="partial255" defaultMessage="You get" />}
          id="needToRenameThisIdTwo"
          currencies={currencies}
          placeholder="0"
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
          <FormattedMessage id="slippage" defaultMessage="Slippage" />
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