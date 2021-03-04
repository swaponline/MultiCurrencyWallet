"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getInternationalPhoneNumberPrefix;

var _core = require("libphonenumber-js/core");

var ONLY_DIGITS_REGEXP = /^\d+$/;

function getInternationalPhoneNumberPrefix(country, metadata) {
  // Standard international phone number prefix: "+" and "country calling code".
  var prefix = '+' + (0, _core.getCountryCallingCode)(country, metadata); // Get "leading digits" for a phone number of the country.
  // If there're "leading digits" then they can be part of the prefix too.

  metadata = new _core.Metadata(metadata);
  metadata.country(country);

  if (metadata.numberingPlan.leadingDigits() && ONLY_DIGITS_REGEXP.test(metadata.numberingPlan.leadingDigits())) {
    prefix += metadata.numberingPlan.leadingDigits();
  }

  return prefix;
}
//# sourceMappingURL=getInternationalPhoneNumberPrefix.js.map