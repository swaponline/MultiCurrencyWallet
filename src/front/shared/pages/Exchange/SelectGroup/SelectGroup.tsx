import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import CSSModules from 'react-css-modules'
import styles from './SelectGroup.scss'
import partialStyles from '../Exchange.scss'

import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { BigNumber } from 'bignumber.js'

import { inputReplaceCommaWithDot } from 'helpers/domUtils'
import getCoinInfo from 'common/coins/getCoinInfo'

// TODO to split data and view this component
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
    idFee,
    tooltipAboutFee,
    haveAmount,
    inputToolTip,
    activeFiat,
    balanceTooltip,
  } = props
  return (
    <div styleName="selectGroup">
      <FieldLabel inRow>
        <strong>{label}</strong>
        {tooltip && (
          <span>
            <span>&nbsp;</span>
            <div styleName="smallTooltip">
              <Tooltip id={id}>{tooltip}</Tooltip>
            </div>
          </span>
        )}
      </FieldLabel>
      <div styleName="groupField" className={className}>
        <Input
          styleName="inputRoot"
          inputContainerClassName="inputContainer"
          inputClassName="selectGroupInput"
          valueLink={inputValueLink}
          type="number"
          placeholder={placeholder}
          pattern="0-9\."
          errorStyle={error}
          disabled={disabled}
          onFocus={props.onFocus ? props.onFocus : () => {}}
          onBlur={props.onBlur ? props.onBlur : () => {}}
          onKeyDown={inputReplaceCommaWithDot}
        />
        {fiat > 0 && (
          <p styleName="textUsd">
            {`~${fiat}`} {activeFiat}
          </p>
        )}
        {inputToolTip && inputToolTip}
        {balanceTooltip && (
          <div styleName="smallTooltip balanceTooltip">
            <Tooltip id="SelectGroupTooltipBalance">{balanceTooltip()}</Tooltip>
          </div>
        )}
        <CurrencySelect
          selectedItemRender={(item) =>  {
            const {blockchain} = getCoinInfo(item.value)

            return blockchain ? `${item.title} (${blockchain})` : item.fullTitle
          }}
          styleName="currencySelect"
          placeholder="Enter the name of coin"
          selectedValue={selectedValue}
          onSelect={onSelect}
          currencies={currencies}
        />
      </div>
      {label.props.defaultMessage === 'You sell' &&
        !extendedControls &&
        (balance > 0 ? (
          !isToken && (
            <span
              styleName={
                new BigNumber(balance).isLessThan(new BigNumber(haveAmount).plus(dynamicFee))
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

export default injectIntl(
  CSSModules(SelectGroup, { ...styles, ...partialStyles }, { allowMultiple: true })
)
