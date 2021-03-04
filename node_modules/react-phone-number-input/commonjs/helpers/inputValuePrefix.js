"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInputValuePrefix = getInputValuePrefix;
exports.removeInputValuePrefix = removeInputValuePrefix;

var _core = require("libphonenumber-js/core");

function getInputValuePrefix(_ref) {
  var country = _ref.country,
      international = _ref.international,
      withCountryCallingCode = _ref.withCountryCallingCode,
      metadata = _ref.metadata;
  return country && international && !withCountryCallingCode ? "+".concat((0, _core.getCountryCallingCode)(country, metadata)) : '';
}

function removeInputValuePrefix(value, prefix) {
  if (prefix) {
    value = value.slice(prefix.length);

    if (value[0] === ' ') {
      value = value.slice(1);
    }
  }

  return value;
}
//# sourceMappingURL=inputValuePrefix.js.map