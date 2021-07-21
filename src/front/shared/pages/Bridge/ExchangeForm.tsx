import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import dropDownStyles from 'components/ui/DropDown/index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'

function ExchangeForm(props) {
  const {
    stateReference,
    isPending,
    fiat,
    fiatAmount,
    openExternalExchange,
    currencies,
    spendedCurrency,
    receivedCurrency,
    slippage,
    chainId,
    selectCurrency,
  } = props

  console.log('%c ExchangeForm', 'font-size: 20px')
  console.log(props)

  const displayCurrencyName = (item) => {
    return item.blockchain ? `${item.title} (${item.blockchain})` : item.title
  }

  return (
    <form action="">
      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="spend" defaultMessage="Spend" />{' '}
          <Tooltip id="spendAmountTooltip">
            <FormattedMessage id="spendAmountNotice" defaultMessage="Some useful notice for user" />
          </Tooltip>
        </FieldLabel>
        <Input
          pattern="0-9\."
          onKeyDown={inputReplaceCommaWithDot}
          valueLink={stateReference.spendedAmount}
          withMargin
        />
        <CurrencySelect
          selectedItemRender={displayCurrencyName}
          className={dropDownStyles.simpleDropdown}
          selectedValue={spendedCurrency.value}
          onSelect={(value) =>
            selectCurrency({
              direction: 'spend',
              value,
            })
          }
          currencies={currencies}
        />
      </div>

      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="receive" defaultMessage="Receive" />{' '}
          <Tooltip id="receiveAmountTooltip">
            <FormattedMessage
              id="receiveAmountNotice"
              defaultMessage="Some useful notice for user"
            />
          </Tooltip>
        </FieldLabel>
        <Input valueLink={stateReference.receivedAmount} disabled withMargin />
        <CurrencySelect
          selectedItemRender={displayCurrencyName}
          className={dropDownStyles.simpleDropdown}
          selectedValue={receivedCurrency.value}
          onSelect={(value) => {
            selectCurrency({
              direction: 'receive',
              value,
            })
          }}
          currencies={currencies}
        />
      </div>

      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="slippage" defaultMessage="Slippage" />
          <Tooltip id="slippageTooltip">
            <FormattedMessage id="slippageNotice" defaultMessage="Some useful notice for user" />
          </Tooltip>
        </FieldLabel>
        <Input valueLink={stateReference.slippage} withMargin />
      </div>
    </form>
  )
}

export default CSSModules(ExchangeForm, styles, { allowMultiple: true })
