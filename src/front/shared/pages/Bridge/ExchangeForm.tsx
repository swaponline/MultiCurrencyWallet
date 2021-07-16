import { FormattedMessage } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import Input from 'components/forms/Input/Input'
import Button from 'components/controls/Button/Button'
import InlineLoader from 'components/loaders/InlineLoader/InlineLoader'
import SelectGroup from 'pages/Exchange/SelectGroup/SelectGroup'

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
    setToken,
    openExternalExchange,
    availableTokens,
  } = props

  return (
    <form styleName="exchangeForm" action="">
      <div styleName="inputWrapper">
        <FieldLabel>
          <FormattedMessage id="fiatAmount" defaultMessage="Fiat amount" />{' '}
          <Tooltip id="fiatAmountTooltip">
            <FormattedMessage id="fiatAmountNotice" defaultMessage="Some useful notice for user" />
          </Tooltip>
        </FieldLabel>
        <Input
          pattern="0-9\."
          onKeyDown={inputReplaceCommaWithDot}
          valueLink={stateReference.fiatAmount}
        />
      </div>

      <SelectGroup
        activeFiat={window.DEFAULT_FIAT}
        dataTut="get"
        inputValueLink={stateReference.tokenAmount}
        selectedValue={token}
        onSelect={setToken}
        disabled={true}
        label={<FormattedMessage id="partial255" defaultMessage="You get" />}
        id="FiatTokenBridge"
        currencies={availableTokens}
        fiat={fiatAmount}
      />

      <div styleName="calculationsWrapper">
        <b>
          {fiat} rate: {}
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
