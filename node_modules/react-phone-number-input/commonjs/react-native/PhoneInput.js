"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _PhoneTextInput = _interopRequireDefault(require("./PhoneTextInput"));

var _PhoneInput = _interopRequireDefault(require("../PhoneInput"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/**
 * This is an _experimental_ React Native component.
 * Feedback thread: https://github.com/catamphetamine/react-phone-number-input/issues/296
 */
function ReactNativePhoneInput(props, ref) {
  return _react["default"].createElement(_PhoneInput["default"], _extends({}, props, {
    ref: ref,
    smartCaret: false,
    inputComponent: _PhoneTextInput["default"]
  }));
}

ReactNativePhoneInput = _react["default"].forwardRef(ReactNativePhoneInput);
var _default = ReactNativePhoneInput;
exports["default"] = _default;
//# sourceMappingURL=PhoneInput.js.map