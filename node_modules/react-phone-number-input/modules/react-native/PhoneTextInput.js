import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'react-native';
/**
 * This is an _experimental_ React Native component.
 * Feedback thread: https://github.com/catamphetamine/react-phone-number-input/issues/296
 */

function PhoneTextInput(_ref, ref) {
  var placeholder = _ref.placeholder,
      autoComplete = _ref.autoComplete,
      autoFocus = _ref.autoFocus,
      value = _ref.value,
      onChange = _ref.onChange;
  // Instead of `onChangeText` it could use `onChange` and get `value` from `nativeEvent.text`.
  var onChangeText = useCallback(function (value) {
    onChange({
      preventDefault: function preventDefault() {
        this.defaultPrevented = true;
      },
      target: {
        value: value
      }
    });
  }, [onChange]);
  return React.createElement(TextInput, {
    ref: ref,
    placeholder: placeholder,
    autoFocus: autoFocus,
    autoCompleteType: autoComplete,
    keyboardType: "phone-pad",
    onChangeText: onChangeText,
    value: value
  });
}

PhoneTextInput = React.forwardRef(PhoneTextInput);
PhoneTextInput.propTypes = {
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};
export default PhoneTextInput;
//# sourceMappingURL=PhoneTextInput.js.map