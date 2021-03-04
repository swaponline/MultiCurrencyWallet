import metadata from 'libphonenumber-js/metadata.min.json';
import { sortCountryOptions, getSupportedCountryOptions, isCountrySupportedWithError, getSupportedCountries } from './countries';
describe('helpers/countries', function () {
  it('should sort country options (no `order`)', function () {
    sortCountryOptions([{
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
    sortCountryOptions([{
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
    sortCountryOptions([{
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
    sortCountryOptions([{
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
    sortCountryOptions([{
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
    getSupportedCountryOptions(['🌐', 'RU', 'XX', '@', '|', '…', '...', '.'], metadata).should.deep.equal(['🌐', 'RU', '|', '…', '...']);
  });
  it('should get supported country options (none supported)', function () {
    expect(getSupportedCountryOptions(['XX', '@', '.'], metadata)).to.be.undefined;
  });
  it('should get supported country options (none supplied)', function () {
    expect(getSupportedCountryOptions(undefined, metadata)).to.be.undefined;
  });
  it('should tell is country is supported with error', function () {
    isCountrySupportedWithError('RU', metadata).should.equal(true);
    isCountrySupportedWithError('XX', metadata).should.equal(false);
  });
  it('should get supported countries', function () {
    getSupportedCountries(['RU', 'XX'], metadata).should.deep.equal(['RU']);
  });
  it('should get supported countries (none supported)', function () {
    expect(getSupportedCountries(['XX'], metadata)).to.be.undefined;
  });
});
//# sourceMappingURL=countries.test.js.map