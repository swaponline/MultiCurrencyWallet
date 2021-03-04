"use strict";

var _examples = _interopRequireDefault(require("../examples.mobile"));

var _metadata = _interopRequireDefault(require("../metadata.min"));

var _getExampleNumber = _interopRequireDefault(require("./getExampleNumber"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('getExampleNumber', function () {
  it('should get an example number', function () {
    var phoneNumber = (0, _getExampleNumber["default"])('RU', _examples["default"], _metadata["default"]);
    phoneNumber.nationalNumber.should.equal('9123456789');
    phoneNumber.number.should.equal('+79123456789');
    phoneNumber.countryCallingCode.should.equal('7');
    phoneNumber.country.should.equal('RU');
  });
  it('should handle a non-existing country', function () {
    expect((0, _getExampleNumber["default"])('XX', _examples["default"], _metadata["default"])).to.be.undefined;
  });
});
//# sourceMappingURL=getExampleNumber.test.js.map