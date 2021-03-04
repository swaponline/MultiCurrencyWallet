"use strict";

var _metadataMin = _interopRequireDefault(require("libphonenumber-js/metadata.min.json"));

var _getInternationalPhoneNumberPrefix = _interopRequireDefault(require("./getInternationalPhoneNumberPrefix"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('getInternationalPhoneNumberPrefix', function () {
  it('should prepend leading digits when generating international phone number prefix', function () {
    // No leading digits.
    (0, _getInternationalPhoneNumberPrefix["default"])('RU', _metadataMin["default"]).should.equal('+7'); // Has "fixed" leading digits.

    (0, _getInternationalPhoneNumberPrefix["default"])('AS', _metadataMin["default"]).should.equal('+1684');
  });
});
//# sourceMappingURL=getInternationalPhoneNumberPrefix.test.js.map