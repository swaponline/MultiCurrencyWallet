import React from "react";
import CSSModules from "react-css-modules";

import PnoneLibInput from "react-phone-number-input";

import styles from "./styles.scss";

const Phone = (props) => {
  const { placeholder, label, error, onChange, value } = props;
  return (
    <div styleName="highLevel phone_inut" className="ym-hide-content">
      {label && label}
      <PnoneLibInput
        styleName="phoneNumber"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <div styleName="rednote">{error}</div>}
    </div>
  );
};

export const PhoneInput = CSSModules(Phone, styles, { allowMultiple: true });
