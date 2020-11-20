import React, { Fragment } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import { constants } from "helpers"
import CSSModules from 'react-css-modules'
import styles from './SelectGroup.scss'

import Input from 'components/forms/Input/Input'
import FieldLabel from 'components/forms/FieldLabel/FieldLabel'
import CurrencySelect from 'components/ui/CurrencySelect/CurrencySelect'
import Tooltip from 'components/ui/Tooltip/Tooltip'
import { BigNumber } from 'bignumber.js'

import { inputReplaceCommaWithDot } from 'helpers/domUtils'


const isDark = localStorage.getItem(constants.localStorage.isDark)
// TODO to split data and view this component
const SelectGroup = (props) => {
  const { dynamicFee, isToken, extendedControls, selectedValue, onSelect,
    currencies, fiat, placeholder, label, disabled, className, switchBalanceFunc, inputValueLink, tooltip, balance, error,
    id, idFee, tooltipAboutFee, haveAmount, notIteractable, inputToolTip,
  } = props

  return (
    <div>
      {/*
      //@ts-ignore */}
      <FieldLabel inRow>
        <strong styleName={`strong ${isDark ? 'dark' : ''}`}>
          {label}
        </strong>
        &nbsp;
        <div styleName="smallTooltip">
          <Tooltip id={id}>
            {tooltip}
          </Tooltip>
        </div>
      </FieldLabel>
      <div styleName="groupField" className={className}>
        <Input
          styleName={`inputRoot ${isDark ? 'darkInput' : ''}`}
          inputContainerClassName="inputContainer"
          valueLink={inputValueLink}
          type="number"
          placeholder={placeholder}
          pattern="0-9\."
          errorStyle={error}
          disabled={disabled}
          onFocus={props.onFocus ? props.onFocus : () => { }}
          onBlur={props.onBlur ? props.onBlur : () => { }}
          onKeyDown={inputReplaceCommaWithDot}
        />
        {
          (selectedValue === 'eth' || selectedValue === 'btc') && fiat > 0 &&
          // todo: fix activeFiat
          //@ts-ignore
          <p styleName="textUsd" >{`~${fiat}`} {activeFiat}</p>
        }
        {inputToolTip && inputToolTip()}
        {/*
        //@ts-ignore */}
        <CurrencySelect
          //name="All"
          label={label}
          tooltip={tooltip}
          switchBalanceFunc={switchBalanceFunc}
          id={id}
          styleName={`currencySelect ${isDark ? 'dark' : ''}`}
          placeholder="Enter the name of coin"
          selectedValue={selectedValue}
          onSelect={onSelect}
          currencies={currencies}
          notIteractable={notIteractable}
        />
      </div>
      {label.props.defaultMessage === 'You sell' && !extendedControls &&
        (balance > 0 ?
          !isToken &&
          <span
            styleName={
              (new BigNumber(haveAmount).isLessThanOrEqualTo(balance)
                && new BigNumber(balance).isLessThan(new BigNumber(haveAmount).plus(dynamicFee))
                && new BigNumber(haveAmount).isGreaterThan(0))
                ? 'red'
                : 'balance'
            }
          >
            <FormattedMessage
              id="select75"
              defaultMessage="Available for exchange: {availableBalance} {tooltip}"
              values={{
                availableBalance: `${new BigNumber(balance).minus(dynamicFee)} ${selectedValue.toUpperCase()}`,
                tooltip: <Tooltip id={idFee}> {tooltipAboutFee}</Tooltip>,
              }} />
          </span> :
          <span styleName="textForNull">
            <FormattedMessage id="selected53" defaultMessage="You can use an external wallet to perform a swap" />
          </span>
        )
      }
    </div>
  )
}


export default injectIntl(CSSModules(SelectGroup, styles, { allowMultiple: true }))
