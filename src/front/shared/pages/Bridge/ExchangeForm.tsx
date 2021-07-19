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
    currency,
    currencyAmount,
    token,
    tokenAmount,
    tokens,
    openExternalExchange,
    selectToken,
  } = props

  return (
    <form styleName="exchangeForm" action="">
      {/* <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="spend" defaultMessage="Spend" />{' '}
          <Tooltip id="fiatAmountTooltip">
            <FormattedMessage id="fiatAmountNotice" defaultMessage="Some useful notice for user" />
          </Tooltip>
        </FieldLabel>
        <Input
          pattern="0-9\."
          onKeyDown={inputReplaceCommaWithDot}
          valueLink={stateReference.fiatAmount}
          withMargin
        />
      </div> */}

      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="spend" defaultMessage="Spend" />{' '}
          <Tooltip id="fiatAmountTooltip">
            <FormattedMessage id="fiatAmountNotice" defaultMessage="Some useful notice for user" />
          </Tooltip>
        </FieldLabel>
        <Input
          pattern="0-9\."
          onKeyDown={inputReplaceCommaWithDot}
          valueLink={stateReference.currencyAmount}
          placeholder="ETH"
          withMargin
        />
      </div>

      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="receive" defaultMessage="Receive" /> {token}
        </FieldLabel>
        <Input valueLink={stateReference.tokenAmount} disabled withMargin />
        <CurrencySelect
          selectedItemRender={(item) => `${item.title} (${item.blockchain})`}
          className={dropDownStyles.simpleDropdown}
          placeholder="Enter the name of token"
          selectedValue={token}
          onSelect={selectToken}
          currencies={tokens}
        />
      </div>

      <div styleName="calculationsWrapper">
        <b>
          {fiat}: {fiatAmount}
        </b>
        <b>
          {currency} rate: 2000 {fiat}
        </b>
        <b>
          {currency}: {currencyAmount}
        </b>
        <b>
          {token}: {tokenAmount}
        </b>
      </div>

      <Button
        styleName="buyButton"
        pending={isPending}
        disabled={isPending}
        onClick={openExternalExchange}
        empty
        big
      >
        <FormattedMessage id="buy" defaultMessage="Buy" />
      </Button>
    </form>
  )
}

export default CSSModules(ExchangeForm, styles, { allowMultiple: true })
