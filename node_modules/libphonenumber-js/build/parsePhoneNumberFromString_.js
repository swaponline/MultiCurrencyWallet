"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = parsePhoneNumberFromString;

var _parsePhoneNumber_ = _interopRequireDefault(require("./parsePhoneNumber_"));

var _ParseError = _interopRequireDefault(require("./ParseError"));

var _metadata = require("./metadata");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function parsePhoneNumberFromString(text, options, metadata) {
  // Validate `defaultCountry`.
  if (options && options.defaultCountry && !(0, _metadata.isSupportedCountry)(options.defaultCountry, metadata)) {
    options = _objectSpread({}, options, {
      defaultCountry: undefined
    });
  } // Parse phone number.


  try {
    return (0, _parsePhoneNumber_["default"])(text, options, metadata);
  } catch (error) {
    /* istanbul ignore else */
    if (error instanceof _ParseError["default"]) {//
    } else {
      throw error;
    }
  }
}
//# sourceMappingURL=parsePhoneNumberFromString_.js.map