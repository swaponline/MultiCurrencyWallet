import metadata from '../metadata.min.json';
import getCountryCallingCode from './getCountryCallingCode';
describe('getCountryCallingCode', function () {
  it('should get country calling code', function () {
    getCountryCallingCode('US', metadata).should.equal('1');
  });
  it('should throw if country is unknown', function () {
    expect(function () {
      return getCountryCallingCode('ZZ', metadata);
    }).to["throw"]('Unknown country: ZZ');
  });
});
//# sourceMappingURL=getCountryCallingCode.test.js.map