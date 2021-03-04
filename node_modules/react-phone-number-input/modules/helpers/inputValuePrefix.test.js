import metadata from 'libphonenumber-js/metadata.min.json';
import { getInputValuePrefix, removeInputValuePrefix } from './inputValuePrefix';
describe('inputValuePrefix', function () {
  it('should get input value prefix', function () {
    getInputValuePrefix({
      country: 'RU',
      metadata: metadata
    }).should.equal('');
    getInputValuePrefix({
      country: 'RU',
      international: true,
      withCountryCallingCode: true,
      metadata: metadata
    }).should.equal('');
    getInputValuePrefix({
      country: 'RU',
      international: true,
      metadata: metadata
    }).should.equal('+7');
  });
  it('should remove input value prefix', function () {
    removeInputValuePrefix('+78005553535', '+7').should.equal('8005553535');
    removeInputValuePrefix('+7 800 555 35 35', '+7').should.equal('800 555 35 35');
    removeInputValuePrefix('8 (800) 555-35-35', '').should.equal('8 (800) 555-35-35');
  });
});
//# sourceMappingURL=inputValuePrefix.test.js.map