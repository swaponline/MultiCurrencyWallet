import searchPhoneNumbersInText from './searchPhoneNumbersInText';
import metadata from '../metadata.min.json';
describe('searchPhoneNumbersInText', function () {
  it('should find phone numbers (with default country)', function () {
    var NUMBERS = ['+78005553535', '+12133734253'];

    for (var _iterator = searchPhoneNumbersInText('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', 'US', metadata), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var number = _ref;
      number.number.number.should.equal(NUMBERS[0]);
      NUMBERS.shift();
    }
  });
  it('should find phone numbers', function () {
    var NUMBERS = ['+78005553535', '+12133734253'];

    for (var _iterator2 = searchPhoneNumbersInText('The number is +7 (800) 555-35-35 and not (213) 373-4253 as written in the document.', metadata), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
      var _ref2;

      if (_isArray2) {
        if (_i2 >= _iterator2.length) break;
        _ref2 = _iterator2[_i2++];
      } else {
        _i2 = _iterator2.next();
        if (_i2.done) break;
        _ref2 = _i2.value;
      }

      var number = _ref2;
      number.number.number.should.equal(NUMBERS[0]);
      NUMBERS.shift();
    }
  });
});
//# sourceMappingURL=searchPhoneNumbersInText.test.js.map