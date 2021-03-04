"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = isValidPhoneNumber;

var _parsePhoneNumber = require("./parsePhoneNumber");

var _parsePhoneNumberFromString_ = _interopRequireDefault(require("./parsePhoneNumberFromString_"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function isValidPhoneNumber() {
  var _normalizeArguments = (0, _parsePhoneNumber.normalizeArguments)(arguments),
      text = _normalizeArguments.text,
      options = _normalizeArguments.options,
      metadata = _normalizeArguments.metadata;

  options = _objectSpread({}, options, {
    extract: false
  });
  var phoneNumber = (0, _parsePhoneNumberFromString_["default"])(text, options, metadata);
  return phoneNumber && phoneNumber.isValid() || false;
}
//# sourceMappingURL=isValidPhoneNumber.js.map