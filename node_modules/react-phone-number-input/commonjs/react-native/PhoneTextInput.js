"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactNative = require("react-native");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function PhoneTextInput(_ref, ref) {
  var placeholder = _ref.placeholder,
      autoComplete = _ref.autoComplete,
      autoFocus = _ref.autoFocus,
      value = _ref.value,
      onChange = _ref.onChange;
  // Instead of `onChangeText` it could use `onChange` and get `value` from `nativeEvent.text`.
  var onChangeText = (0, _react.useCallback)(function (value) {
    onChange({
      preventDefault: function preventDefault() {
        this.defaultPrevented = true;
      },
      target: {
        value: value
      }
    });
  }, [onChange]);
  return _react["default"].createElement(_reactNative.TextInput, {
    ref: ref,
    placeholder: placeholder,
    autoFocus: autoFocus,
    autoCompleteType: autoComplete,
    keyboardType: "phone-pad",
    onChangeText: onChangeText,
    value: value
  });
}

PhoneTextInput = _react["default"].forwardRef(PhoneTextInput);
PhoneTextInput.propTypes = {
  placeholder: _propTypes["default"].string,
  autoComplete: _propTypes["default"].string,
  autoFocus: _propTypes["default"].bool,
  value: _propTypes["default"].string,
  onChange: _propTypes["default"].func.isRequired
};
var _default = PhoneTextInput;
exports["default"] = _default;
//# sourceMappingURL=PhoneTextInput.js.map