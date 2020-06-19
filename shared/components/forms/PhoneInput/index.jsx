import React from 'react'
import CSSModules from 'react-css-modules'

import PnoneLibInput from 'react-phone-number-input'
import { getCountryCallingCode } from 'react-phone-number-input'

import styles from './styles.scss'


const Phone = (props) => {
  const { placeholder, label, error, onChange, value } = props
  const _onChange = (phone) => {
    if (!phone) {
      try {
        const selectedCountry = document.querySelector('.PhoneInputCountry SELECT').value
        phone = `+${getCountryCallingCode(selectedCountry)} `
        document.querySelector('.PhoneInputInput').value = phone
      } catch (e) { }
    } else {
      onChange(phone)
    }
  }
  return (
    <div styleName="highLevel phone_inut" className="ym-hide-content">
      {label && label}
      <PnoneLibInput
        styleName="phoneNumber"
        value={value}
        onChange={_onChange}
        placeholder={placeholder}
      />
      {error && <div styleName="rednote">{error}</div>}
    </div>
  );
};

export const PhoneInput = CSSModules(Phone, styles, { allowMultiple: true });
