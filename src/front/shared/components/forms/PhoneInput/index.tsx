import React from 'react'
import CSSModules from 'react-css-modules'

import PnoneLibInput, { getCountryCallingCode } from 'react-phone-number-input'

import styles from './styles.scss'


const Phone = (props) => {
  const { placeholder, label, error, onChange, locale } = props

  // Нет такой страны как EN, RU, итд...
  // let countryCode = `+${getCountryCallingCode((locale))}`
  let countryCode = `+1`

  const onHandleChange = (phone) => {
    try {
      //@ts-ignore
      const { value: country } = document.querySelector('.PhoneInputCountry SELECT')
      countryCode = `+${getCountryCallingCode(country)}`
    } catch (e) {
    }

    if (!phone || !phone.includes(countryCode.replace(/ /g, ""))) {
      const phoneInput = document.querySelector<HTMLInputElement>('.PhoneInputInput')

      if (phoneInput) {
        phoneInput.value = countryCode.replace(/ /g, "")
      }
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
