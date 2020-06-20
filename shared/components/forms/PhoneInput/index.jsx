import React from 'react'
import CSSModules from 'react-css-modules'

import PnoneLibInput, { getCountryCallingCode } from 'react-phone-number-input'

import styles from './styles.scss'


const Phone = (props) => {
  const { placeholder, label, error, onChange, locale } = props
  let countryCode = `+${getCountryCallingCode(locale.toUpperCase())}`

  const onHandleChange = (phone) => {
    try {
      const { value: country } = document.querySelector('.PhoneInputCountry SELECT')
      countryCode = `+${getCountryCallingCode(country)}`
    } catch (e) {
    }

    if (!phone || !phone.includes(countryCode.replace(/ /g, ""))) {
      document.querySelector('.PhoneInputInput').value = countryCode.replace(/ /g, "")
    } else {
      onChange(phone)
    }
  }

  return (
    <div styleName="highLevel phone_inut" className="ym-hide-content">
      {label && label}
      <PnoneLibInput
        styleName="phoneNumber"
        onChange={onHandleChange}
        placeholder={placeholder}
        defaultCountry={locale.toUpperCase()}
      />
      {error && <div styleName="rednote">{error}</div>}
    </div>
  );
};

export const PhoneInput = CSSModules(Phone, styles, { allowMultiple: true });
