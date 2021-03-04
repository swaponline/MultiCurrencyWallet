"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _formatPhoneNumber2 = _interopRequireWildcard(require("./formatPhoneNumber"));

var _metadataMin = _interopRequireDefault(require("libphonenumber-js/metadata.min.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function call(func, _arguments) {
  var args = Array.prototype.slice.call(_arguments);
  args.push(_metadataMin["default"]);
  return func.apply(this, args);
}

function formatPhoneNumber() {
  return call(_formatPhoneNumber2["default"], arguments);
}

function formatPhoneNumberIntl() {
  return call(_formatPhoneNumber2.formatPhoneNumberIntl, arguments);
}

describe('formatPhoneNumber', function () {
  it('should format phone numbers', function () {
    expect(function () {
      return formatPhoneNumber();
    }).to["throw"]('must be a string'); // formatPhoneNumber().should.equal('')

    formatPhoneNumber(null).should.equal('');
    formatPhoneNumber('').should.equal('');
    expect(function () {
      return (0, _formatPhoneNumber2["default"])('+1', 'NATIONAL');
    }).to["throw"]('`metadata` argument not passed');
    expect(function () {
      return (0, _formatPhoneNumber2["default"])('+12133734253', undefined, _metadataMin["default"]);
    }).to["throw"]('Unknown "format"');
    expect(function () {
      return (0, _formatPhoneNumber2["default"])('+12133734253', '123', _metadataMin["default"]);
    }).to["throw"]('Unknown "format"');
    formatPhoneNumber('+1', 'NATIONAL').should.equal('');
    formatPhoneNumber('+12133734253', 'NATIONAL').should.equal('(213) 373-4253');
    formatPhoneNumber('+12133734253').should.equal('(213) 373-4253');
    formatPhoneNumber('+12133734253', 'INTERNATIONAL').should.equal('+1 213 373 4253'); // Deprecated.
    // Legacy `format`s.

    formatPhoneNumber('+12133734253', 'National').should.equal('(213) 373-4253');
    formatPhoneNumber('+12133734253', 'International').should.equal('+1 213 373 4253');
  });
  it('should format international phone numbers', function () {
    formatPhoneNumberIntl('+12133734253').should.equal('+1 213 373 4253');
  });
});
//# sourceMappingURL=formatPhoneNumber.test.js.map