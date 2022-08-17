import { BigNumber } from 'bignumber.js'
import { FormattedMessage, injectIntl } from 'react-intl'
import CSSModules from 'react-css-modules'
import styles from './index.scss'
import getCoinInfo from 'common/coins/getCoinInfo'
import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import Input from 'components/forms/Input/Input'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import Tooltip from 'components/ui/Tooltip/Tooltip'

const SelectGroup = (props) => {
  const {
    dynamicFee,
    isToken,
    extendedControls,
    selectedValue,
    onSelect,
    currencies,
    fiat,
    placeholder,
    label,
    disabled,
    className,
    inputValueLink,
    tooltip,
    balance,
    error,
    id,
    inputId,
    idFee,
    tooltipAboutFee,
    haveAmount,
    inputToolTip,
    activeFiat,
    onKeyUp,
    dontDisplayError,
    onFocus,
    onBlur,
  } = props

  const doNothing = () => {}
  const currAllowed = currencies.filter((item) => !item.dontCreateOrder)
  const canСalculate = balance && dynamicFee

  return (
    <div styleName="selectGroup">
      <div styleName="row">
        {label && <strong styleName="label">{label}</strong>}

        {tooltip && (
          <div styleName="smallTooltip">
            <Tooltip id={id}>{tooltip}</Tooltip>
          </div>
        )}
      </div>

      <div styleName="groupField" className={className}>
        <Input
          styleName="inputRoot"
          inputContainerClassName="inputContainer"
          inputClassName="selectGroupInput"
          id={inputId}
          valueLink={inputValueLink}
          type="number"
          placeholder={placeholder}
          pattern="0-9\."
          errorStyle={error}
          disabled={disabled}
          onFocus={onFocus ? onFocus : doNothing}
          onBlur={onBlur ? onBlur : doNothing}
          onKeyUp={onKeyUp ? onKeyUp : doNothing}
          onKeyDown={inputReplaceCommaWithDot}
          dontDisplayError={dontDisplayError}
        />
        {fiat > 0 && (
          <p styleName="textUsd">
            {`~${fiat}`} {activeFiat}
          </p>
        )}
        {inputToolTip && inputToolTip}

        <CurrencySelect
          selectedItemRender={(item) => {
            const { blockchain } = getCoinInfo(item.value)

            return blockchain ? `${item.title.replaceAll('*','')} (${blockchain})` : item.fullTitle
          }}
          styleName="currencySelect"
          placeholder="Enter the name of coin"
          selectedValue={selectedValue}
          onSelect={onSelect}
          currencies={currAllowed}
        />
      </div>
      {label?.props?.defaultMessage === 'You sell' &&
        !extendedControls &&
        (canСalculate ? (
          !isToken && (
            <span
              styleName={
                new BigNumber(balance).isLessThan(new BigNumber(haveAmount).plus(dynamicFee)) &&
                new BigNumber(haveAmount).isGreaterThan(0)
                  ? 'red'
                  : 'balance'
              }
            >
              <FormattedMessage
                id="select75"
                defaultMessage="Available for exchange: {availableBalance} {tooltip}"
                values={{
                  availableBalance: `${new BigNumber(balance).minus(
                    dynamicFee
                  )} ${selectedValue.toUpperCase()}`,
                  tooltip: <Tooltip id={idFee}> {tooltipAboutFee}</Tooltip>,
                }}
              />
            </span>
          )
        ) : (
          <span styleName="textForNull">
            <FormattedMessage
              id="selected53"
              defaultMessage="You can use an external wallet to perform a swap"
            />
          </span>
        ))}
    </div>
  )
}

export default injectIntl(CSSModules(SelectGroup, styles, { allowMultiple: true }))
