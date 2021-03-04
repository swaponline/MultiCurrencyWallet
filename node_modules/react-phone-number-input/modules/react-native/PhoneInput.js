function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from 'react';
import PhoneTextInput from './PhoneTextInput';
import PhoneInput from '../PhoneInput';
/**
 * This is an _experimental_ React Native component.
 * Feedback thread: https://github.com/catamphetamine/react-phone-number-input/issues/296
 */

function ReactNativePhoneInput(props, ref) {
  return React.createElement(PhoneInput, _extends({}, props, {
    ref: ref,
    smartCaret: false,
    inputComponent: PhoneTextInput
  }));
}

ReactNativePhoneInput = React.forwardRef(ReactNativePhoneInput);
export default ReactNativePhoneInput;
//# sourceMappingURL=PhoneInput.js.map