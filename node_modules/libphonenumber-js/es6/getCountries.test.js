import metadata from '../metadata.min.json';
import getCountries from './getCountries';
describe('getCountries', function () {
  it('should get countries list', function () {
    expect(getCountries(metadata).indexOf('RU') > 0).to.be["true"];
  });
});
//# sourceMappingURL=getCountries.test.js.map