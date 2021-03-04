import metadata from 'libphonenumber-js/metadata.min.json';
import getInternationalPhoneNumberPrefix from './getInternationalPhoneNumberPrefix';
describe('getInternationalPhoneNumberPrefix', function () {
  it('should prepend leading digits when generating international phone number prefix', function () {
    // No leading digits.
    getInternationalPhoneNumberPrefix('RU', metadata).should.equal('+7'); // Has "fixed" leading digits.

    getInternationalPhoneNumberPrefix('AS', metadata).should.equal('+1684');
  });
});
//# sourceMappingURL=getInternationalPhoneNumberPrefix.test.js.map