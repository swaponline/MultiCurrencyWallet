"use strict";

var _metadataMin = _interopRequireDefault(require("libphonenumber-js/metadata.min.json"));

var _inputValuePrefix = require("./inputValuePrefix");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('inputValuePrefix', function () {
  it('should get input value prefix', function () {
    (0, _inputValuePrefix.getInputValuePrefix)({
      country: 'RU',
      metadata: _metadataMin["default"]
    }).should.equal('');
    (0, _inputValuePrefix.getInputValuePrefix)({
      country: 'RU',
      international: true,
      withCountryCallingCode: true,
      metadata: _metadataMin["default"]
    }).should.equal('');
    (0, _inputValuePrefix.getInputValuePrefix)({
      country: 'RU',
      international: true,
      metadata: _metadataMin["default"]
    }).should.equal('+7');
  });
  it('should remove input value prefix', function () {
    (0, _inputValuePrefix.removeInputValuePrefix)('+78005553535', '+7').should.equal('8005553535');
    (0, _inputValuePrefix.removeInputValuePrefix)('+7 800 555 35 35', '+7').should.equal('800 555 35 35');
    (0, _inputValuePrefix.removeInputValuePrefix)('8 (800) 555-35-35', '').should.equal('8 (800) 555-35-35');
  });
});
//# sourceMappingURL=inputValuePrefix.test.js.map