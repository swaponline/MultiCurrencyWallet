"use strict";

var _metadataMin = _interopRequireDefault(require("libphonenumber-js/metadata.min.json"));

var _countries = require("./countries");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('helpers/countries', function () {
  it('should sort country options (no `order`)', function () {
    (0, _countries.sortCountryOptions)([{
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }]).should.deep.equal([{
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }]);
  });
  it('should sort country options (with a divider)', function () {
    (0, _countries.sortCountryOptions)([{
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }], ['US', '|', 'RU']).should.deep.equal([{
      value: 'US',
      label: 'United States'
    }, {
      divider: true
    }, {
      value: 'RU',
      label: 'Russia'
    }]);
  });
  it('should sort country options (with "...")', function () {
    (0, _countries.sortCountryOptions)([{
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }], ['US', '|', '...']).should.deep.equal([{
      value: 'US',
      label: 'United States'
    }, {
      divider: true
    }, {
      value: 'RU',
      label: 'Russia'
    }]);
  });
  it('should sort country options (with "…")', function () {
    (0, _countries.sortCountryOptions)([{
      value: 'RU',
      label: 'Russia'
    }, {
      value: 'US',
      label: 'United States'
    }], ['US', '|', '…']).should.deep.equal([{
      value: 'US',
      label: 'United States'
    }, {
      divider: true
    }, {
      value: 'RU',
      label: 'Russia'
    }]);
  });
  it('should sort country options (with "🌐")', function () {
    (0, _countries.sortCountryOptions)([{
      value: 'RU',
      label: 'Russia'
    }, {
      label: 'International'
    }, {
      value: 'US',
      label: 'United States'
    }], ['US', '🌐', '…']).should.deep.equal([{
      value: 'US',
      label: 'United States'
    }, {
      label: 'International'
    }, {
      value: 'RU',
      label: 'Russia'
    }]);
  });
  it('should get supported country options', function () {
    (0, _countries.getSupportedCountryOptions)(['🌐', 'RU', 'XX', '@', '|', '…', '...', '.'], _metadataMin["default"]).should.deep.equal(['🌐', 'RU', '|', '…', '...']);
  });
  it('should get supported country options (none supported)', function () {
    expect((0, _countries.getSupportedCountryOptions)(['XX', '@', '.'], _metadataMin["default"])).to.be.undefined;
  });
  it('should get supported country options (none supplied)', function () {
    expect((0, _countries.getSupportedCountryOptions)(undefined, _metadataMin["default"])).to.be.undefined;
  });
  it('should tell is country is supported with error', function () {
    (0, _countries.isCountrySupportedWithError)('RU', _metadataMin["default"]).should.equal(true);
    (0, _countries.isCountrySupportedWithError)('XX', _metadataMin["default"]).should.equal(false);
  });
  it('should get supported countries', function () {
    (0, _countries.getSupportedCountries)(['RU', 'XX'], _metadataMin["default"]).should.deep.equal(['RU']);
  });
  it('should get supported countries (none supported)', function () {
    expect((0, _countries.getSupportedCountries)(['XX'], _metadataMin["default"])).to.be.undefined;
  });
});
//# sourceMappingURL=countries.test.js.map