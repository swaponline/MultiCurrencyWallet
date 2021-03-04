"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = formatPhoneNumber;
exports.formatPhoneNumberIntl = formatPhoneNumberIntl;

var _core = require("libphonenumber-js/core");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function formatPhoneNumber(value, format, metadata) {
  if (!metadata) {
    if (_typeof(format) === 'object') {
      metadata = format;
      format = 'NATIONAL';
    }
  }

  if (!value) {
    return '';
  }

  var phoneNumber = (0, _core.parsePhoneNumberFromString)(value, metadata);

  if (!phoneNumber) {
    return '';
  } // Deprecated.
  // Legacy `format`s.


  switch (format) {
    case 'National':
      format = 'NATIONAL';
      break;

    case 'International':
      format = 'INTERNATIONAL';
      break;
  }

  return phoneNumber.format(format);
}

function formatPhoneNumberIntl(value, metadata) {
  return formatPhoneNumber(value, 'INTERNATIONAL', metadata);
}
//# sourceMappingURL=formatPhoneNumber.js.map