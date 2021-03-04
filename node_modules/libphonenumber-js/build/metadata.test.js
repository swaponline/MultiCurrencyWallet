"use strict";

var _metadataMin = _interopRequireDefault(require("../metadata.min.json"));

var _metadata = _interopRequireWildcard(require("./metadata"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

describe('metadata', function () {
  it('should return undefined for non-defined types', function () {
    var FR = new _metadata["default"](_metadataMin["default"]).country('FR');
    type(FR.type('FIXED_LINE')).should.equal('undefined');
  });
  it('should validate country', function () {
    var thrower = function thrower() {
      return new _metadata["default"](_metadataMin["default"]).country('RUS');
    };

    thrower.should["throw"]('Unknown country');
  });
  it('should tell if a country is supported', function () {
    (0, _metadata.isSupportedCountry)('RU', _metadataMin["default"]).should.equal(true);
    (0, _metadata.isSupportedCountry)('XX', _metadataMin["default"]).should.equal(false);
  });
  it('should return ext prefix for a country', function () {
    (0, _metadata.getExtPrefix)('US', _metadataMin["default"]).should.equal(' ext. ');
    (0, _metadata.getExtPrefix)('CA', _metadataMin["default"]).should.equal(' ext. ');
    (0, _metadata.getExtPrefix)('GB', _metadataMin["default"]).should.equal(' x'); // expect(getExtPrefix('XX', metadata)).to.equal(undefined)

    (0, _metadata.getExtPrefix)('XX', _metadataMin["default"]).should.equal(' ext. ');
  });
  it('should cover non-occuring edge cases', function () {
    new _metadata["default"](_metadataMin["default"]).getNumberingPlanMetadata('999');
  });
  it('should support deprecated methods', function () {
    new _metadata["default"](_metadataMin["default"]).country('US').nationalPrefixForParsing().should.equal('1');
    new _metadata["default"](_metadataMin["default"]).chooseCountryByCountryCallingCode('1').nationalPrefixForParsing().should.equal('1');
  });
  it('should tell if a national prefix is mandatory when formatting a national number', function () {
    var meta = new _metadata["default"](_metadataMin["default"]); // No "national_prefix_formatting_rule".
    // "national_prefix_is_optional_when_formatting": true

    meta.country('US');
    meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat().should.equal(false); // "national_prefix_formatting_rule": "8 ($1)"
    // "national_prefix_is_optional_when_formatting": true

    meta.country('RU');
    meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat().should.equal(false); // "national_prefix": "0"
    // "national_prefix_formatting_rule": "0 $1"

    meta.country('FR');
    meta.numberingPlan.formats()[0].nationalPrefixIsMandatoryWhenFormattingInNationalFormat().should.equal(true);
  });
  it('should validate metadata', function () {
    var thrower = function thrower() {
      return (0, _metadata.validateMetadata)();
    };

    thrower.should["throw"]('`metadata` argument not passed');

    thrower = function thrower() {
      return (0, _metadata.validateMetadata)(123);
    };

    thrower.should["throw"]('Got a number: 123.');

    thrower = function thrower() {
      return (0, _metadata.validateMetadata)('abc');
    };

    thrower.should["throw"]('Got a string: abc.');

    thrower = function thrower() {
      return (0, _metadata.validateMetadata)({
        a: true,
        b: 2
      });
    };

    thrower.should["throw"]('Got an object of shape: { a, b }.');

    thrower = function thrower() {
      return (0, _metadata.validateMetadata)({
        a: true,
        countries: 2
      });
    };

    thrower.should["throw"]('Got an object of shape: { a, countries }.');

    thrower = function thrower() {
      return (0, _metadata.validateMetadata)({
        country_calling_codes: true,
        countries: 2
      });
    };

    thrower.should["throw"]('Got an object of shape');

    thrower = function thrower() {
      return (0, _metadata.validateMetadata)({
        country_calling_codes: {},
        countries: 2
      });
    };

    thrower.should["throw"]('Got an object of shape');
    (0, _metadata.validateMetadata)({
      country_calling_codes: {},
      countries: {},
      b: 3
    });
  });
});

function type(something) {
  return _typeof(something);
}
//# sourceMappingURL=metadata.test.js.map