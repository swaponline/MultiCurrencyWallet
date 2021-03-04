import metadata from '../metadata.min';
import PhoneNumber from './PhoneNumber';
describe('PhoneNumber', function () {
  it('should validate constructor arguments', function () {
    expect(function () {
      return new PhoneNumber();
    }).to["throw"]('`countryCallingCode` not passed');
    expect(function () {
      return new PhoneNumber('7');
    }).to["throw"]('`nationalNumber` not passed');
  });
  it('should accept country code argument', function () {
    var phoneNumber = new PhoneNumber('RU', '8005553535', metadata);
    phoneNumber.countryCallingCode.should.equal('7');
    phoneNumber.country.should.equal('RU');
    phoneNumber.number.should.equal('+78005553535');
  });
  it('should format number with options', function () {
    var phoneNumber = new PhoneNumber('7', '8005553535', metadata);
    phoneNumber.ext = '123';
    phoneNumber.format('NATIONAL', {
      formatExtension: function formatExtension(number, extension) {
        return "".concat(number, " \u0434\u043E\u0431. ").concat(extension);
      }
    }).should.equal('8 (800) 555-35-35 доб. 123');
  });
  it('should compare phone numbers', function () {
    new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('RU', '8005553535', metadata)).should.equal(true);
    new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('7', '8005553535', metadata)).should.equal(true);
    new PhoneNumber('RU', '8005553535', metadata).isEqual(new PhoneNumber('RU', '8005553536', metadata)).should.equal(false);
  });
  it('should tell if a number is non-geographic', function () {
    new PhoneNumber('7', '8005553535', metadata).isNonGeographic().should.equal(false);
    new PhoneNumber('870', '773111632', metadata).isNonGeographic().should.equal(true);
  });
});
//# sourceMappingURL=PhoneNumber.test.js.map