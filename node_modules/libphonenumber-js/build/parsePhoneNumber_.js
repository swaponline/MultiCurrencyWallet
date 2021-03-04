"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = parsePhoneNumber;

var _parse_ = _interopRequireDefault(require("./parse_"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function parsePhoneNumber(text, options, metadata) {
  return (0, _parse_["default"])(text, _objectSpread({}, options, {
    v2: true
  }), metadata);
}
//# sourceMappingURL=parsePhoneNumber_.js.map